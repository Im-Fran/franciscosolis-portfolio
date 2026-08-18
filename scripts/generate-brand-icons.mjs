#!/usr/bin/env node
/**
 * Rasterizes the FranciscoSolis mark into the favicon / app-icon set.
 *
 * The mark is two shapes on a 64×64 grid, so rendering it exactly is cheaper than pulling in a
 * rasterizer: this samples the geometry directly and writes PNGs with zlib. Re-run via
 * `pnpm brand:icons` whenever public/brand/svg/fs-mark.svg changes.
 */
import {deflateSync} from "node:zlib";
import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/* Geometry, on the 64×64 grid used by public/brand/svg/fs-mark.svg. */
const GRID = 64;
const TILE_RADIUS = 14;
/* The tile carries the brand gradient: periwinkle at bottom-left → plum at top-right, 45°. */
const PERIWINKLE = [0x5a, 0x68, 0xc4];
const PLUM = [0x8a, 0x42, 0x70];
const PEAK = [[32, 14], [50, 50], [37.5, 50], [32, 39], [26.5, 50], [14, 50]];
/** Samples per axis, per pixel. 4×4 is enough to keep the peak's diagonals clean at 16 px. */
const SUPERSAMPLE = 4;
/** Maskable icons must keep their artwork inside the central 80% safe zone. */
const MASKABLE_SAFE_ZONE = 0.8;

const insideRoundedRect = (x, y) => {
  if (x < 0 || y < 0 || x > GRID || y > GRID) return false;
  const cx = Math.min(Math.max(x, TILE_RADIUS), GRID - TILE_RADIUS);
  const cy = Math.min(Math.max(y, TILE_RADIUS), GRID - TILE_RADIUS);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= TILE_RADIUS * TILE_RADIUS;
};

const insidePolygon = (x, y, points) => {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/**
 * Samples the brand gradient at a point given in unit coordinates of the tile's own box.
 *
 * The SVG runs it from (0, 1) to (1, 0) — bottom-left to top-right, 45° — so the parameter is the
 * projection onto that axis. Never reverse or re-angle it; see docs/BRAND.md.
 */
const gradientAt = (u, v, channel) => {
  const t = Math.min(Math.max((u - v + 1) / 2, 0), 1);
  return PERIWINKLE[channel] + (PLUM[channel] - PERIWINKLE[channel]) * t;
};

/**
 * Renders one icon as raw RGBA.
 *
 * @param size edge length in px
 * @param maskable when true, drops the rounded tile for a full-bleed gradient field and shrinks the
 *   peak into the safe zone, as Android's adaptive icons expect
 */
const render = (size, maskable) => {
  const pixels = Buffer.alloc(size * size * 4);
  const step = 1 / SUPERSAMPLE;
  const samples = SUPERSAMPLE * SUPERSAMPLE;
  /* Grid units per output pixel; the maskable variant shrinks the artwork, so its scale differs. */
  const artScale = maskable ? GRID / (size * MASKABLE_SAFE_ZONE) : GRID / size;
  const artOffset = maskable ? (-(1 - MASKABLE_SAFE_ZONE) / 2) * size * artScale : 0;

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let tile = 0;
      let peak = 0;

      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const gx = (px + (sx + 0.5) * step) * artScale + artOffset;
          const gy = (py + (sy + 0.5) * step) * artScale + artOffset;
          if (maskable || insideRoundedRect(gx, gy)) tile++;
          if (insidePolygon(gx, gy, PEAK)) peak++;
        }
      }

      /* The peak is white-on-gradient, so composite it over the tile before writing the pixel. */
      const tileAlpha = maskable ? 1 : tile / samples;
      const peakAlpha = Math.min(peak / samples, tileAlpha);
      const white = peakAlpha;
      const fill = tileAlpha - peakAlpha;
      const alpha = tileAlpha;
      const at = (py * size + px) * 4;
      /* The gradient spans the tile, which is the whole canvas in both variants. */
      const u = (px + 0.5) / size;
      const v = (py + 0.5) / size;

      if (alpha > 0) {
        for (let c = 0; c < 3; c++) {
          pixels[at + c] = Math.round((white * 255 + fill * gradientAt(u, v, c)) / alpha);
        }
      }
      pixels[at + 3] = Math.round(alpha * 255);
    }
  }

  return pixels;
};

const crcTable = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const encodePng = (size, pixels) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; /* bit depth */
  ihdr[9] = 6; /* truecolor + alpha */

  /* One filter byte per scanline; filter 0 (none) compresses fine for flat artwork. */
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, {level: 9})),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

/** Packs PNG payloads into an ICO container, which browsers accept as of Vista. */
const encodeIco = (entries) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); /* type: icon */
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = entries.map(({size, png}) => {
    const entry = Buffer.alloc(16);
    /* 256 is encoded as 0 in the single-byte width/height fields. */
    entry[0] = size % 256;
    entry[1] = size % 256;
    entry.writeUInt16LE(1, 4); /* color planes */
    entry.writeUInt16LE(32, 6); /* bits per pixel */
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...directory, ...entries.map(({png}) => png)]);
};

const png = (size, {maskable = false} = {}) => encodePng(size, render(size, maskable));

mkdirSync(OUT_DIR, {recursive: true});

const written = [];
const write = (name, buffer) => {
  writeFileSync(join(OUT_DIR, name), buffer);
  written.push(`${name} (${buffer.length} B)`);
};

/* The vector favicon is the mark itself; emitting it here keeps it in step with the raster set. */
write("favicon.svg", Buffer.from(readFileSync(join(OUT_DIR, "brand", "svg", "fs-mark.svg"))));
write("apple-touch-icon.png", png(180));
write("icon-192.png", png(192));
write("icon-512.png", png(512));
write("icon-maskable-512.png", png(512, {maskable: true}));
write("favicon.ico", encodeIco([16, 32, 48].map((size) => ({size, png: png(size)}))));

console.log(`brand icons written to public/:\n  ${written.join("\n  ")}`);
