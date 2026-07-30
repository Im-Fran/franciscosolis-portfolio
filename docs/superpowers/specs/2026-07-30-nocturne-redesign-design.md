# Rediseño Nocturne del portafolio — Spec

Fecha: 2026-07-30

## Contexto

El portafolio actual (`franciscosolis.cl`, Vite + React 19 + Tailwind v4 + react-i18next +
react-router + Cloudflare Worker) se rediseña por completo a partir de un handoff de
Claude Design (`portafolio.dc.html`, prototipo de referencia visual, no código de
producción). El nuevo diseño es un one-pager oscuro llamado **Nocturne**: hero, stack
técnico, proyectos, timeline de experiencia y contacto, animado con GSAP + ScrollTrigger,
cursor personalizado y selector de idioma ES/EN.

El handoff completo (paleta, tipografía, espaciado, copy exacto ES/EN, comportamiento de
cada interacción) vive en el mensaje original del usuario y se cita inline en las
secciones de abajo — no se duplica un archivo aparte.

## Alcance

- Reemplazo completo de `src/pages/home/*` (secciones de la home).
- Nuevo design system Nocturne integrado a los tokens Tailwind v4 existentes.
- Features actuales que el nuevo diseño no contempla (theme toggle light/dark,
  selector de tamaño de texto, cookie-consent, sección de GitHub stats) se mueven a
  `src/legacy/` — lógica intacta, pero desconectada del render activo.
- Contenido de proyectos (4 destacados + 3 secundarios) queda como **placeholders
  editables**; el usuario los reemplaza después con GIFs/links reales.
- Botón de descarga de CV queda deshabilitado con tag "Próximamente".
- Fuera de alcance: CV real, GIFs reales de proyectos, reactivar features legacy.

## 1. Legacy

Mover a `src/legacy/` (manteniendo su estructura interna) sin modificar lógica:
- `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`
- `src/contexts/TextSizeContext.tsx`, `src/components/ui/text-size-selector.tsx`
- `src/components/cookie-consent.tsx`
- `src/pages/home/components/github-stats.tsx` (+ su backend en `src/worker/stats/github`
  se mantiene intacto donde está, no es frontend)

`layout.tsx` deja de importar `ThemeProvider`, `TextSizeProvider` y `CookieConsent`.
`home.tsx` deja de importar `GithubStats`.

## 2. Design tokens (Nocturne)

En `src/lib/main.css`, dentro de `@theme`, reemplazar la paleta actual por:

```
--color-bg: #161826
--color-surface: #232532
--color-text: #e9e9ed
--color-accent: #9184d9

--color-neutral-100: #f3f5fe   --color-accent-100: #f5f4ff
--color-neutral-200: #e4e7f5   --color-accent-200: #e7e5fe
--color-neutral-300: #cfd3e5   --color-accent-300: #d2cefd
--color-neutral-400: #b2b6ca   --color-accent-400: #b5abfc
--color-neutral-500: #9397ab   --color-accent-500: #968ae0
--color-neutral-600: #75798c   --color-accent-600: #796cbf
--color-neutral-700: #595d6c   --color-accent-700: #5d5294
--color-neutral-800: #3f424d   --color-accent-800: #423a6a
--color-neutral-900: #292b31   --color-accent-900: #2b2741

--radius-sm: 4px
--radius-md: 8px
--radius-lg: 14px

--shadow-sm: 0 0 0 1px #3f424d
--shadow-md: 0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,.55)
--shadow-lg: 0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,.65)
```

Uso: fondo=bg, texto=text/neutral-200/300, bordes/hovers=neutral-700/800,
acento de texto de párrafo=accent-300 (nunca accent puro para body text, 3:1 contraste),
iconos/marcas cortas=accent puro.

Tipografía: Inter (Google Fonts, pesos 400/500) vía `<link>` en `index.html`. Headings con
`font-weight: 500` (nunca bold) y `letter-spacing: -0.015em`.
- H1 hero: `clamp(48px, 9vw, 120px)`, line-height 0.98
- H2 sección: `clamp(30px, 4vw, 46px)`
- H2 contacto: `clamp(32px, 5.5vw, 64px)`
- Kicker: 13-14px uppercase, letter-spacing 0.08em, color accent-300
- Body: 15-18px, line-height 1.55–1.6, color neutral-200/300

Espaciado: escala compacta (densidad 0.7×), secciones con padding vertical ~90-120px en
desktop. Sitio dark-only: sin clases `.dark`/`.light`, sin toggle activo en render. El
sistema de `text-small/normal/large` en CSS se mantiene funcional (por si legacy se
reactiva) pero sin selector visible.

## 3. Componentes base (cva)

- `Button` (`src/components/ui/button`): variantes `primary` (outline acento, sin
  relleno), `secondary`, `ghost`. Focus visible: `outline: 2px solid var(--color-accent);
  outline-offset: 2px`.
- `Badge` → renombrado conceptualmente a uso de "Tag": variantes `tag-accent`,
  `tag-outline`, `tag-neutral`.
- `Card` (`src/components/ui/card.tsx`): sub-componentes `CardTitle`/`CardBody`, variantes
  de elevación `elev-sm`/`elev-md` (mapean a `--shadow-sm`/`--shadow-md`).
- `Nav` nuevo (`src/pages/home/components/nav.tsx`): fijo, `backdrop-filter: blur(14px)`,
  fondo bg al 78% opacidad, borde inferior 1px neutral-800. Marca "Fran.dev" (punto en
  accent-300). Links de ancla (Proyectos/Stack/Experiencia/Contacto) + botón ghost de
  idioma (muestra "EN" en modo ES y viceversa).

`@radix-ui/react-tabs` y `dropdown-menu` quedan sin uso en el render activo (sus
consumidores actuales viven en legacy); no se desinstalan.

## 4. Secciones de página

`src/pages/home/components/`:

- **`nav.tsx`** — descrito arriba.
- **`hero.tsx`** (`#top`, `min-height: 100vh`) — círculo radial-gradient decorativo
  (accent 22%, blur, parallax `y:120` scrub con ScrollTrigger `start:'top top'`,
  `end:'bottom top'`) arriba-derecha; línea vertical con gradiente que se desvanece,
  abajo-izquierda. Contenido flush-left: kicker "Hola, soy", H1 "Francisco Solís", H2 rol,
  párrafo bio, dos CTAs (`btn-primary` mailto, `btn-secondary` GitHub). Indicador de
  scroll (ícono mouse + "Scroll") con float infinito `translateY`, 3s ease-in-out.
  Animación de entrada: 5 elementos `data-fs-hero-line` parten de `opacity:0,y:40px`
  (`gsap.set`) y animan a `opacity:1,y:0`, `duration:0.9`, `ease:power3.out`,
  `stagger:0.08`, `delay:0.15`.
- **`stack.tsx`** (`#stack`) — kicker "Herramientas" + H2 "Con qué construyo". Grid
  `auto-fit, minmax(260px,1fr)`, 4 `Card.elev-sm` (Frontend/Backend/Móvil/APIs & Infra),
  ícono Phosphor 28px accent-300, nombre categoría, fila de `tag-outline`.
- **`projects.tsx`** (`#proyectos`) — kicker "Trabajo" + H2 "Proyectos destacados". Grid
  principal `auto-fit, minmax(420px,1fr)`, 4 `Card.elev-md` sin padding en contenedor:
  slot imagen/GIF 260px arriba, luego padding interno con `tag-accent` de categoría,
  título (placeholder "Nombre del proyecto"), descripción placeholder, fila
  `tag-outline` de stack, link "Ver proyecto →". Fila secundaria: grid
  `auto-fit, minmax(240px,1fr)` con 3 tarjetas pequeñas (ícono+título+descripción,
  clicables) + 1 tarjeta borde accent-700 "Ver todos los proyectos" →
  `github.com/Im-Fran`. Datos en `src/pages/home/components/projects/projects.data.ts`
  (placeholders editables).
- **`experience.tsx`** (`#experiencia`, reemplaza el actual) — kicker "Trayectoria" + H2
  "Cómo he llegado hasta aquí". Timeline vertical (max-width 760px): línea con gradiente
  accent-600→neutral-800, `scaleY` 0→1, `transformOrigin:top`, `scrub:true` ligado al
  progreso de la sección completa. 4 hitos (punto circular borde accent-300, relleno bg):
  Inicios/Después/Luego/Hoy con el copy exacto del handoff (ver sección Copy abajo).
- **`contact.tsx`** (`#contacto`, nuevo) — círculo decorativo accent 18% arriba-izquierda.
  Kicker "Contacto" + H2 grande "¿Construyamos algo juntos?". Email grande clicable
  `fsolism@franciscosolis.cl` con borde inferior accent-500. Fila `btn-ghost` con ícono:
  GitHub, LinkedIn, X, Instagram. Botón "Descargar CV" deshabilitado (opacity 0.5) + tag
  "Próximamente". Footer: "Santiago, Chile" (izq) + "© 2026 Francisco Solís" (der),
  separados por borde superior.

`home.tsx`:
```tsx
export const Home = () => <>
  <Nav/>
  <Hero/>
  <Stack/>
  <Projects/>
  <Experience/>
  <Contact/>
</>
```

## 5. Interacciones (GSAP)

Nueva dependencia: `gsap` (incluye ScrollTrigger). Sin alternativa ya instalada que cubra
scrub/pin.

- **Cursor personalizado** (`src/pages/home/hooks/useCustomCursor.ts`): solo se monta si
  `matchMedia('(pointer: fine)').matches`. Dos elementos fixed: punto 6px (accent,
  `gsap.quickTo`, duration 0.1) y anillo 34px (accent-300, duration 0.35). Al pasar sobre
  `a`, `button` o `[data-fs-hover]`: anillo escala 1.8× (`duration:0.3`), vuelve a 1× al
  salir. `body.fs-cursor-active` se agrega en JS **solo tras confirmar el montaje** — el
  CSS nunca oculta el cursor del sistema de forma incondicional.
- **Scroll reveals** (`src/pages/home/hooks/useScrollReveal.ts`, hook reutilizable por
  sección): elementos `.reveal` animan `from({y:30,opacity:0})` a
  `{duration:0.8,ease:'power3.out'}`, trigger `start:'top 85%'`. Grupos `.reveal-stagger`
  animan sus `.reveal-item` con `{y:40,opacity:0,duration:0.7,stagger:0.1}`, trigger en el
  propio grupo `start:'top 80%'`.
- **Micro-interacciones**: clase `fs-hoverable` → `translateY(-4px)` en hover,
  `transition: 0.35s cubic-bezier(.16,1,.3,1)`.

## 6. i18n

Namespaces en `src/translations/{es,en}/`: `nav.json` (nuevo), `hero.json` (actualizado),
`stack.json` (nuevo), `projects.json` (actualizado), `experience.json` (reemplaza copy
actual), `contact.json` (nuevo). El botón de idioma del nav llama
`i18n.changeLanguage('es'|'en')` — sin recarga (comportamiento nativo de i18next).

### Copy — Español

- Nav: Proyectos, Stack, Experiencia, Contacto
- Hero: kicker "Hola, soy" · H1 "Francisco Solís" · H2 "Full-Stack & Mobile Developer" ·
  bio "Amante del café ☕ y de crear soluciones elegantes para todo tipo de proyectos 💻.
  Experiencia Full-Stack, Móvil, APIs y microservicios 📱🔧 — siempre aprendiendo algo
  nuevo 🚀." · CTAs "Trabajemos juntos" (mailto:fsolism@franciscosolis.cl), "Ver GitHub"
  (github.com/Im-Fran)
- Stack: kicker "Herramientas" · título "Con qué construyo"
- Proyectos: kicker "Trabajo" · título "Proyectos destacados" · "Ver proyecto" · "Ver
  todos los proyectos"
- Timeline: kicker "Trayectoria" · título "Cómo he llegado hasta aquí"
  - Inicios — Autodidacta desde cero — "Empecé programando por curiosidad, explorando
    proyectos abiertos y aprendiendo Java y Kotlin sin miedo a equivocarme."
  - Después — Desarrollo Full-Stack — "Sumé frontend y backend web, construyendo
    productos completos de punta a punta."
  - Luego — Móvil, APIs & microservicios — "Extendí mi trabajo a apps móviles y
    arquitecturas de servicios desacoplados y APIs robustas."
  - Hoy — Nuevos desafíos — "Sigo aprendiendo tecnologías nuevas y buscando proyectos
    donde aportar y crecer en equipo."
- Contacto: kicker "Contacto" · título "¿Construyamos algo juntos?" · "Descargar CV" ·
  "Próximamente" · ubicación "Santiago, Chile"

### Copy — English

Traducción 1:1 del bloque anterior (nav, hero, stack, proyectos, timeline, contacto),
misma estructura de namespaces.

### Datos de contacto

- Email: fsolism@franciscosolis.cl
- GitHub: github.com/Im-Fran
- LinkedIn: linkedin.com/in/fsolism
- X: x.com/Im_Fran_
- Instagram: instagram.com/fran.dev_

## 7. Iconografía

`@phosphor-icons/react` (variante *regular*) para íconos de UI: mouse-simple,
arrow-up-right, browser, hard-drives, device-mobile, stack, code, package,
terminal-window, map-pin, arrow-right. `@icons-pack/react-simple-icons` (ya instalado) se
mantiene para logos de marca (GitHub, LinkedIn, X, Instagram) — mejor fidelidad de marca
que Phosphor. `lucide-react` queda sin nuevos usos; no se desinstala si algo en legacy aún
lo referencia.

## 8. Testing / verificación

Sin lógica de negocio compleja — no se agregan tests unitarios nuevos (contenido +
animación declarativa). Verificación:
- `pnpm build` (tsc + vite build) para chequeo de tipos.
- Pasada visual manual (Chrome/Playwright) tras implementar: scroll completo verificando
  reveals y timeline scrub, cursor custom en desktop (`pointer:fine`), ausencia de cursor
  custom en viewport mobile, toggle de idioma sin recarga, responsive de los grids.

## Fuera de alcance

- Contenido real de proyectos (GIFs, títulos, descripciones, links).
- CV real para descarga.
- Reactivar theme toggle / text-size / cookie-consent / github-stats en el render activo.
