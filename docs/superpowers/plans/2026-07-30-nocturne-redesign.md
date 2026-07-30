# Nocturne Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current portfolio home page with the "Nocturne" one-pager design (hero, stack, projects, experience timeline, contact) — dark-only, GSAP-animated, ES/EN via the existing i18next setup.

**Architecture:** Same Vite + React 19 + Tailwind v4 + react-router + react-i18next app. New Tailwind `@theme` tokens replace the current palette. `Button`/`Badge(Tag)`/`Card` are rewritten with `cva` against the new tokens. New section components live under `src/pages/home/components/`. Two GSAP hooks (`useCustomCursor`, `useScrollReveal`) are shared across sections. Current non-Nocturne features (theme toggle, text size, cookie consent, GitHub stats) move to `src/legacy/` untouched and unwired.

**Tech Stack:** React 19, Vite 8, Tailwind CSS v4 (`@theme`), class-variance-authority, react-i18next, GSAP + ScrollTrigger (new dependency), @phosphor-icons/react (new dependency), @icons-pack/react-simple-icons (existing, brand icons only).

## Global Constraints

- Dark-only. No `.dark`/`.light` class toggling in the active render tree.
- Colors, spacing, radii, shadows: use exactly the Nocturne values below — never invent new ones.
- Headings: Inter weight 500 (never bold), `letter-spacing: -0.015em`.
- `.btn-primary` is outline-style (accent border, transparent fill) — never a filled accent button.
- Body text never uses pure `--color-accent` (3:1 contrast) — use `accent-300` for accent-colored body/paragraph text.
- Focus-visible rings: `outline: 2px solid var(--color-accent); outline-offset: 2px` — never the browser default blue.
- Cursor: `cursor: none` is applied only via `body.fs-cursor-active`, added in JS after the custom cursor mounts successfully. Never unconditionally in static CSS.
- All new user-facing copy goes through react-i18next namespaces (`es`/`en` JSON pairs), not hardcoded strings.
- Package manager is `pnpm`. Verify with `pnpm build` (runs `tsc -b && vite build`) at the end of each task that touches TypeScript.
- Path alias `@/*` → `src/*` (see `tsconfig.app.json`) — use it in all new imports, matching existing code style.

---

### Task 1: Move legacy features out of the active render tree

**Files:**
- Create dir: `src/legacy/` (mirrors current relative structure)
- Move: `src/components/theme-provider.tsx` → `src/legacy/components/theme-provider.tsx`
- Move: `src/components/theme-toggle.tsx` → `src/legacy/components/theme-toggle.tsx`
- Move: `src/contexts/TextSizeContext.tsx` → `src/legacy/contexts/TextSizeContext.tsx`
- Move: `src/components/ui/text-size-selector.tsx` → `src/legacy/components/ui/text-size-selector.tsx`
- Move: `src/components/cookie-consent.tsx` → `src/legacy/components/cookie-consent.tsx`
- Move: `src/pages/home/components/github-stats.tsx` → `src/legacy/components/github-stats.tsx`
- Modify: `src/components/layout.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/pages/home/home.tsx`

**Interfaces:**
- Produces: `src/components/layout.tsx` exports `Layout` (default) with signature unchanged (`LayoutProps = BaseProperties`), but no longer renders `ThemeProvider`, `TextSizeProvider`, or `CookieConsent`.
- Produces: `src/components/footer.tsx` exports `Footer` (default) — later replaced fully in Task 9, for now just drop the `useTextSize` dependency so it still compiles standalone.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/legacy/components/ui src/legacy/contexts
git mv src/components/theme-provider.tsx src/legacy/components/theme-provider.tsx
git mv src/components/theme-toggle.tsx src/legacy/components/theme-toggle.tsx
git mv src/contexts/TextSizeContext.tsx src/legacy/contexts/TextSizeContext.tsx
git mv src/components/ui/text-size-selector.tsx src/legacy/components/ui/text-size-selector.tsx
git mv src/components/cookie-consent.tsx src/legacy/components/cookie-consent.tsx
git mv src/pages/home/components/github-stats.tsx src/legacy/components/github-stats.tsx
```

- [ ] **Step 2: Fix internal imports inside the moved files**

Open each moved file and update any `@/components/...` or `@/contexts/...` self-references to their new `@/legacy/...` path. `theme-toggle.tsx` imports `theme-provider.tsx` — update that import to `@/legacy/components/theme-provider.tsx`. `text-size-selector.tsx` imports `TextSizeContext` — update to `@/legacy/contexts/TextSizeContext.tsx`.

- [ ] **Step 3: Strip legacy wiring from `layout.tsx`**

Replace the full contents of `src/components/layout.tsx` with:

```tsx
import {Outlet, ScrollRestoration} from "react-router-dom";
import type {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => (
  <div className={className} {...rest}>
    <main role={"main"} className={"min-h-screen flex flex-col"}>
      <Outlet/>
    </main>
    <ScrollRestoration/>
    <Footer/>
  </div>
);

export default Layout
export type LayoutProps = BaseProperties
```

- [ ] **Step 4: Strip `useTextSize` from `footer.tsx` temporarily**

Replace the full contents of `src/components/footer.tsx` with a minimal placeholder that still compiles (it gets fully rebuilt in Task 9):

```tsx
const Footer = () => <footer role={"contentinfo"}/>;

export default Footer;
```

- [ ] **Step 5: Drop the `GithubStats` import from `home.tsx`**

Edit `src/pages/home/home.tsx` — remove the `GithubStats` import and its usage:

```tsx
import {Hero} from "@/pages/home/components/hero.tsx";
import {Projects} from "@/pages/home/components/projects/projects.tsx";
import {Experience} from "@/pages/home/components/experience/experience.tsx";
import {Skills} from "@/pages/home/components/skills.tsx";
import {Certifications} from "@/pages/home/components/certifications/certifications.tsx";

export const Home = () => <>
  <Hero/>
  <Projects/>
  <Skills/>
  <Experience/>
  <Certifications/>
</>
```

(Hero/Projects/Skills/Experience/Certifications get replaced in later tasks — this step only removes the GithubStats wiring so the build stays green.)

- [ ] **Step 6: Verify the build**

Run: `pnpm build`
Expected: succeeds with no TypeScript errors. `GithubStats`, `ThemeProvider`, `TextSizeProvider`, `CookieConsent` should have zero remaining imports outside `src/legacy/`.

Run: `grep -rn "theme-provider\|TextSizeContext\|cookie-consent\|github-stats" src --include='*.tsx' --include='*.ts' -l | grep -v '^src/legacy/'`
Expected: no output (nothing outside legacy references them).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move theme/text-size/cookie-consent/github-stats to legacy"
```

---

### Task 2: Nocturne design tokens + Inter font

**Files:**
- Modify: `src/lib/main.css`
- Modify: `index.html`

**Interfaces:**
- Produces: Tailwind utility classes `bg-bg`, `bg-surface`, `text-text`, `text-accent`, `text-accent-300`, `border-neutral-700`, `border-neutral-800`, `shadow-[var(--shadow-sm)]` etc. become available for all later tasks via the `@theme` block below.

- [ ] **Step 1: Replace the `@theme` block in `src/lib/main.css`**

Replace the full file contents with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #161826;
  --color-surface: #232532;
  --color-text: #e9e9ed;
  --color-accent: #9184d9;

  --color-neutral-100: #f3f5fe;
  --color-neutral-200: #e4e7f5;
  --color-neutral-300: #cfd3e5;
  --color-neutral-400: #b2b6ca;
  --color-neutral-500: #9397ab;
  --color-neutral-600: #75798c;
  --color-neutral-700: #595d6c;
  --color-neutral-800: #3f424d;
  --color-neutral-900: #292b31;

  --color-accent-100: #f5f4ff;
  --color-accent-200: #e7e5fe;
  --color-accent-300: #d2cefd;
  --color-accent-400: #b5abfc;
  --color-accent-500: #968ae0;
  --color-accent-600: #796cbf;
  --color-accent-700: #5d5294;
  --color-accent-800: #423a6a;
  --color-accent-900: #2b2741;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;

  --shadow-sm: 0 0 0 1px #3f424d;
  --shadow-md: 0 0 0 1px #595d6c, 0 6px 18px rgba(0, 0, 0, .55);
  --shadow-lg: 0 0 0 1px #9397ab, 0 16px 40px rgba(0, 0, 0, .65);

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

/* Text Size (kept for legacy re-activation, not user-visible right now) */
:root {
  --base-font-size: 16px;
}

html.text-small {
  font-size: calc(var(--base-font-size) * 0.875);
}

html.text-normal {
  font-size: var(--base-font-size);
}

html.text-large {
  font-size: calc(var(--base-font-size) * 1.25);
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 500;
  letter-spacing: -0.015em;
}

*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Load Inter and clean up `index.html`**

Edit `index.html`:
1. Add inside `<head>`, before the existing `<title>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet">
```
2. Replace the `<body>` tag's class (currently `class="bg-linear-to-b from-white dark:from-black to-neutral-100 dark:to-gray-950 text-black dark:text-white"`) with nothing — background/text now come from the `body` rule in `main.css`:
```html
<body>
```

- [ ] **Step 3: Verify the build**

Run: `pnpm build`
Expected: succeeds. Run `pnpm dev`, open the site, confirm the background is `#161826` and text renders in Inter (DevTools → computed `font-family`).

- [ ] **Step 4: Commit**

```bash
git add src/lib/main.css index.html
git commit -m "feat: add Nocturne design tokens and Inter font"
```

---

### Task 3: Rebuild Button, Tag (Badge), Card with cva on Nocturne tokens

**Files:**
- Modify: `src/components/ui/button/buttonVariants.ts`
- Modify: `src/components/ui/button/button.tsx` (no signature change expected, verify only)
- Modify: `src/components/ui/badge/badge-variants.ts`
- Modify: `src/components/ui/badge/badge.tsx` (no signature change expected, verify only)
- Modify: `src/components/ui/card.tsx`

**Interfaces:**
- Produces: `buttonVariants({variant: 'primary'|'secondary'|'ghost', size: 'default'|'sm'|'lg'|'icon'})`.
- Produces: `badgeVariants({variant: 'accent'|'outline'|'neutral', size: 'default'|'sm'|'lg'})` — consumed as `<Badge variant="outline">` etc. by later tasks (used as the "Tag" component from the spec).
- Produces: `Card` gains a `elevation?: 'sm' | 'md'` prop (default `'sm'`) alongside its existing `className` passthrough; `CardTitle` and `CardBody` are new named exports (`CardBody` replaces `CardContent` for Nocturne markup, `CardContent`/`CardHeader`/`CardDescription`/`CardFooter` stay exported unchanged for anything still using the old shape during migration).

- [ ] **Step 1: Rewrite `buttonVariants.ts`**

```ts
import {cva} from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: "border border-accent text-accent-300 bg-transparent hover:bg-accent-900/40",
        secondary: "border border-neutral-700 text-neutral-200 bg-transparent hover:bg-neutral-800/60",
        ghost: "border border-transparent text-neutral-200 bg-transparent hover:bg-neutral-800/40",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export {buttonVariants}
```

`button.tsx` needs no structural change — it already reads `variant`/`size` generically via `VariantProps<typeof buttonVariants>`. Open it and confirm this still typechecks after the variants rename (old callers using `variant="outline"`/`"default"`/`"destructive"` will now fail to typecheck — that's expected and intentional, they get fixed in later tasks as each section is rewritten).

- [ ] **Step 2: Rewrite `badge-variants.ts` (the "Tag" component)**

```ts
import {cva, type VariantProps} from "class-variance-authority";
import type * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] border px-2.5 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        accent: "border-transparent bg-accent-900/60 text-accent-300",
        outline: "border-neutral-700 text-neutral-300 bg-transparent",
        neutral: "border-transparent bg-neutral-800 text-neutral-300",
      },
      size: {
        default: "h-6 text-xs px-2.5",
        sm: "h-5 px-2 text-[11px]",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  },
)
```

`badge.tsx` needs no structural change (same generic passthrough) — confirm it still typechecks.

- [ ] **Step 3: Rewrite `card.tsx`**

```tsx
import * as React from "react"
import {cva, type VariantProps} from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-[var(--radius-md)] bg-surface text-text",
  {
    variants: {
      elevation: {
        sm: "shadow-[var(--shadow-sm)]",
        md: "shadow-[var(--shadow-md)]",
      },
    },
    defaultVariants: {
      elevation: "sm",
    },
  },
)

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, elevation, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ elevation }), className)} {...props} />
))
Card.displayName = "Card"

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-medium text-text", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6", className)} {...props} />,
)
CardBody.displayName = "CardBody"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-neutral-400", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardTitle, CardBody, CardHeader, CardFooter, CardDescription, CardContent }
```

- [ ] **Step 4: Typecheck (build will fail on old call sites — expected)**

Run: `pnpm build`
Expected: fails, listing every file that still uses the old `variant="outline"`/`"default"`/`"secondary"` (old badge) values or `CardContent`-only markup. Note the file list — Tasks 4-9 rewrite each of them. Do not fix them here.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui
git commit -m "feat: rebuild Button/Badge/Card variants on Nocturne tokens"
```

---

### Task 4: GSAP hooks — `useScrollReveal` and `useCustomCursor`

**Files:**
- Create: `src/pages/home/hooks/useScrollReveal.ts`
- Create: `src/pages/home/hooks/useCustomCursor.ts`
- Create: `src/pages/home/components/custom-cursor.tsx`
- Modify: `package.json` (add `gsap`)

**Interfaces:**
- Produces: `useScrollReveal(scope: React.RefObject<HTMLElement>): void` — call inside any section component; scans `scope.current` for `.reveal` and `.reveal-stagger > .reveal-item` and wires the ScrollTrigger animations described in the spec. Idempotent per mount (uses `gsap.context` scoped to `scope`, reverted on unmount).
- Produces: `CustomCursor` component — mounted once, in `Layout`, renders the dot+ring and manages `body.fs-cursor-active`.

- [ ] **Step 1: Install GSAP**

```bash
pnpm add gsap
```

- [ ] **Step 2: Write `useScrollReveal.ts`**

```ts
import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const useScrollReveal = (scope: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    if (!scope.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>(".reveal-item");
        if (items.length === 0) return;
        gsap.from(items, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: group,
            start: "top 80%",
          },
        });
      });
    }, scope);

    return () => ctx.revert();
  }, [scope]);
};
```

- [ ] **Step 3: Write `useCustomCursor.ts`**

```ts
import {useLayoutEffect, type RefObject} from "react";
import gsap from "gsap";

export const useCustomCursor = (
  dotRef: RefObject<HTMLDivElement | null>,
  ringRef: RefObject<HTMLDivElement | null>,
) => {
  useLayoutEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!dotRef.current || !ringRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    const moveDot = gsap.quickTo(dot, "x", {duration: 0.1, ease: "power3"});
    const moveDotY = gsap.quickTo(dot, "y", {duration: 0.1, ease: "power3"});
    const moveRing = gsap.quickTo(ring, "x", {duration: 0.35, ease: "power3"});
    const moveRingY = gsap.quickTo(ring, "y", {duration: 0.35, ease: "power3"});

    const onMove = (e: MouseEvent) => {
      moveDot(e.clientX);
      moveDotY(e.clientY);
      moveRing(e.clientX);
      moveRingY(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [data-fs-hover]");
      if (target) gsap.to(ring, {scale: 1.8, duration: 0.3});
    };

    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a, button, [data-fs-hover]");
      if (target) gsap.to(ring, {scale: 1, duration: 0.3});
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.body.classList.add("fs-cursor-active");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("fs-cursor-active");
    };
  }, [dotRef, ringRef]);
};
```

- [ ] **Step 4: Write `custom-cursor.tsx`**

```tsx
import {useRef} from "react";
import {useCustomCursor} from "@/pages/home/hooks/useCustomCursor.ts";

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useCustomCursor(dotRef, ringRef);

  return <>
    <div ref={dotRef} className="pointer-events-none fixed top-0 left-0 z-[9999] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent hidden [body.fs-cursor-active_&]:block"/>
    <div ref={ringRef} className="pointer-events-none fixed top-0 left-0 z-[9999] h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-300 hidden [body.fs-cursor-active_&]:block"/>
  </>
};
```

- [ ] **Step 5: Add the `cursor: none` rule scoped to the active class**

Append to `src/lib/main.css`:

```css
body.fs-cursor-active,
body.fs-cursor-active * {
  cursor: none;
}
```

- [ ] **Step 6: Mount `CustomCursor` in `Layout`**

Edit `src/components/layout.tsx`, add the import and render it once inside the root div:

```tsx
import {Outlet, ScrollRestoration} from "react-router-dom";
import type {BaseProperties} from "@/main.tsx";
import Footer from "@/components/footer.tsx";
import {CustomCursor} from "@/pages/home/components/custom-cursor.tsx";

const Layout = ({ className, ...rest }: LayoutProps) => (
  <div className={className} {...rest}>
    <CustomCursor/>
    <main role={"main"} className={"min-h-screen flex flex-col"}>
      <Outlet/>
    </main>
    <ScrollRestoration/>
    <Footer/>
  </div>
);

export default Layout
export type LayoutProps = BaseProperties
```

- [ ] **Step 7: Manual check (no unit test — this is a DOM/pointer-event integration, not pure logic)**

Run `pnpm dev`, open in a desktop browser: confirm the system cursor disappears and the dot+ring follow the mouse, and the ring scales up over any link/button. Resize DevTools to a touch device emulation (or check `matchMedia('(pointer: fine)')` returns false there): confirm the system cursor stays visible and no `fs-cursor-active` class is added (inspect `<body>`).

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml src/pages/home/hooks src/pages/home/components/custom-cursor.tsx src/components/layout.tsx src/lib/main.css
git commit -m "feat: add GSAP scroll-reveal and custom cursor hooks"
```

---

### Task 5: Nav component

**Files:**
- Create: `src/pages/home/components/nav.tsx`
- Create: `src/translations/es/nav.json`
- Create: `src/translations/en/nav.json`
- Modify: `src/main.tsx` (register `nav` namespace)

**Interfaces:**
- Produces: `Nav` component, self-contained (reads/writes `i18n.language` directly), rendered first in `home.tsx` (wired in Task 9).

- [ ] **Step 1: Write the translation namespaces**

`src/translations/es/nav.json`:
```json
{
  "projects": "Proyectos",
  "stack": "Stack",
  "experience": "Experiencia",
  "contact": "Contacto"
}
```

`src/translations/en/nav.json`:
```json
{
  "projects": "Projects",
  "stack": "Stack",
  "experience": "Experience",
  "contact": "Contact"
}
```

- [ ] **Step 2: Register the namespace in `main.tsx`**

Edit `src/main.tsx`, add `'nav'` and `'stack'` and `'contact'` to the `ns` array (the latter two are created in Tasks 7 and 9 respectively — registering all three now avoids touching this file three times):

```ts
ns: ['common', 'personal_info', 'projects', 'skills', 'experience', 'github_stats', 'hero', 'certifications', 'nav', 'stack', 'contact'],
```

- [ ] **Step 3: Write `nav.tsx`**

```tsx
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button/button.tsx";

const links: Array<{ href: string; labelKey: string }> = [
  {href: "#proyectos", labelKey: "nav:projects"},
  {href: "#stack", labelKey: "nav:stack"},
  {href: "#experiencia", labelKey: "nav:experience"},
  {href: "#contacto", labelKey: "nav:contact"},
];

export const Nav = () => {
  const {t, i18n} = useTranslation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    localStorage.setItem("locale", newLang);
    await i18n.changeLanguage(newLang);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-bg/78 backdrop-blur-[14px]">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <a href="#top" className="text-base font-medium text-text" data-fs-hover>
          Fran<span className="text-accent-300">.</span>dev
        </a>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden text-sm text-neutral-300 hover:text-text transition-colors sm:inline"
              data-fs-hover
            >
              {t(link.labelKey)}
            </a>
          ))}
          <Button variant="ghost" size="sm" onClick={toggleLanguage} data-fs-hover>
            {i18n.language === "es" ? "EN" : "ES"}
          </Button>
        </div>
      </nav>
    </header>
  );
};
```

- [ ] **Step 4: Verify the build**

Run: `pnpm build`
Expected: succeeds (Nav isn't wired into `home.tsx` yet — that happens in Task 9 — but it must compile standalone).

- [ ] **Step 5: Commit**

```bash
git add src/pages/home/components/nav.tsx src/translations/es/nav.json src/translations/en/nav.json src/main.tsx
git commit -m "feat: add Nocturne nav component"
```

---

### Task 6: Hero component

**Files:**
- Modify: `src/pages/home/components/hero.tsx` (full rewrite)
- Modify: `src/translations/es/hero.json`
- Modify: `src/translations/en/hero.json`

**Interfaces:**
- Produces: `Hero` component exported from `hero.tsx`, `id="top"`, self-contained GSAP entrance animation (does not depend on `useScrollReveal` — the spec's entrance animation runs on mount, not on scroll).

- [ ] **Step 1: Rewrite `src/translations/es/hero.json`**

```json
{
  "avatar_alt": "Foto profesional de Francisco Solís Maturana",
  "kicker": "Hola, soy",
  "name": "Francisco Solís",
  "role": "Full-Stack & Mobile Developer",
  "bio": "Amante del café ☕ y de crear soluciones elegantes para todo tipo de proyectos 💻. Experiencia Full-Stack, Móvil, APIs y microservicios 📱🔧 — siempre aprendiendo algo nuevo 🚀.",
  "cta_work": "Trabajemos juntos",
  "cta_github": "Ver GitHub",
  "scroll": "Scroll"
}
```

- [ ] **Step 2: Rewrite `src/translations/en/hero.json`**

```json
{
  "avatar_alt": "Professional photo of Francisco Solís Maturana",
  "kicker": "Hi, I'm",
  "name": "Francisco Solís",
  "role": "Full-Stack & Mobile Developer",
  "bio": "Coffee ☕ lover and elegant-solution builder for all kinds of projects 💻. Full-Stack, Mobile, APIs and microservices experience 📱🔧 — always learning something new 🚀.",
  "cta_work": "Let's work together",
  "cta_github": "View GitHub",
  "scroll": "Scroll"
}
```

- [ ] **Step 3: Rewrite `hero.tsx`**

```tsx
import {useLayoutEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {MouseSimple, GithubLogo} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button/button.tsx";

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-fs-hero-line]");
      gsap.set(lines, {opacity: 0, y: 40});
      gsap.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.15,
      });

      if (circleRef.current && sectionRef.current) {
        gsap.to(circleRef.current, {
          y: 120,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={sectionRef} className="relative min-h-screen w-full overflow-hidden flex flex-col justify-end">
      <div
        ref={circleRef}
        className="pointer-events-none absolute -top-24 -right-24 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{background: "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 70%)"}}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-8 h-2/3 w-px"
        style={{background: "linear-gradient(to bottom, transparent, var(--color-neutral-700), transparent)"}}
      />

      <div className="container mx-auto px-4 pb-24 pt-32 relative z-10">
        <p data-fs-hero-line className="text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-4">
          {t("hero:kicker")}
        </p>
        <h1 data-fs-hero-line className="text-[clamp(48px,9vw,120px)] leading-[0.98] text-text">
          {t("hero:name")}
        </h1>
        <h2 data-fs-hero-line className="mt-4 text-[clamp(20px,3vw,32px)] text-neutral-300">
          {t("hero:role")}
        </h2>
        <p data-fs-hero-line className="mt-6 max-w-xl text-[16px] leading-[1.6] text-neutral-300">
          {t("hero:bio")}
        </p>
        <div data-fs-hero-line className="mt-8 flex flex-wrap gap-4">
          <Button asChild variant="primary" data-fs-hover>
            <a href="mailto:fsolism@franciscosolis.cl">{t("hero:cta_work")}</a>
          </Button>
          <Button asChild variant="secondary" data-fs-hover>
            <a href="https://github.com/Im-Fran" target="_blank" rel="noreferrer">
              <GithubLogo size={18}/>
              {t("hero:cta_github")}
            </a>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-4 flex items-center gap-2 text-neutral-500 animate-[fs-float_3s_ease-in-out_infinite]">
        <MouseSimple size={18}/>
        <span className="text-xs uppercase tracking-[0.08em]">{t("hero:scroll")}</span>
      </div>
    </section>
  );
};
```

- [ ] **Step 4: Add the float keyframes**

Append to `src/lib/main.css`:

```css
@keyframes fs-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

- [ ] **Step 5: Install Phosphor icons**

```bash
pnpm add @phosphor-icons/react
```

- [ ] **Step 6: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/components/hero.tsx src/translations/es/hero.json src/translations/en/hero.json src/lib/main.css package.json pnpm-lock.yaml
git commit -m "feat: rebuild Hero section for Nocturne"
```

---

### Task 7: Stack section

**Files:**
- Create: `src/pages/home/components/stack.tsx`
- Create: `src/translations/es/stack.json`
- Create: `src/translations/en/stack.json`

**Interfaces:**
- Consumes: `useScrollReveal` from Task 4, `Card`/`CardTitle`/`CardBody`/`Badge` from Task 3.
- Produces: `Stack` component, `id="stack"`.

- [ ] **Step 1: Write `src/translations/es/stack.json`**

```json
{
  "kicker": "Herramientas",
  "title": "Con qué construyo",
  "categories": [
    {"name": "Frontend", "tools": ["React", "Next.js", "TypeScript", "Tailwind CSS"]},
    {"name": "Backend", "tools": ["Node.js", "Java", "Kotlin", "Spring Boot"]},
    {"name": "Móvil", "tools": ["Kotlin", "Android", "React Native"]},
    {"name": "APIs & Infra", "tools": ["REST APIs", "Microservicios", "Docker", "Git"]}
  ]
}
```

- [ ] **Step 2: Write `src/translations/en/stack.json`**

```json
{
  "kicker": "Toolbox",
  "title": "What I build with",
  "categories": [
    {"name": "Frontend", "tools": ["React", "Next.js", "TypeScript", "Tailwind CSS"]},
    {"name": "Backend", "tools": ["Node.js", "Java", "Kotlin", "Spring Boot"]},
    {"name": "Mobile", "tools": ["Kotlin", "Android", "React Native"]},
    {"name": "APIs & Infra", "tools": ["REST APIs", "Microservices", "Docker", "Git"]}
  ]
}
```

- [ ] **Step 3: Write `stack.tsx`**

```tsx
import {useRef} from "react";
import {useTranslation} from "react-i18next";
import {Browser, HardDrives, DeviceMobile, Stack as StackIcon} from "@phosphor-icons/react";
import {Card, CardTitle, CardBody} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

type StackCategory = { name: string; tools: string[] };

const icons = [Browser, HardDrives, DeviceMobile, StackIcon];

export const Stack = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  const categories = t("stack:categories", {returnObjects: true}) as StackCategory[];

  return (
    <section id="stack" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("stack:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-10">
        {t("stack:title")}
      </h2>

      <div className="reveal-stagger grid gap-6" style={{gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"}}>
        {categories.map((category, index) => {
          const Icon = icons[index % icons.length];
          return (
            <Card key={category.name} elevation="sm" className="reveal-item fs-hoverable transition-transform">
              <CardBody>
                <Icon size={28} className="text-accent-300 mb-4"/>
                <CardTitle>{category.name}</CardTitle>
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.tools.map((tool) => (
                    <Badge key={tool} variant="outline">{tool}</Badge>
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
```

- [ ] **Step 4: Add the `fs-hoverable` utility**

Append to `src/lib/main.css`:

```css
.fs-hoverable {
  transition: transform 0.35s cubic-bezier(.16, 1, .3, 1);
}

.fs-hoverable:hover {
  transform: translateY(-4px);
}
```

- [ ] **Step 5: Register the `stack` namespace**

Already added to `main.tsx`'s `ns` array in Task 5 step 2 — confirm it's present, no further edit needed.

- [ ] **Step 6: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/components/stack.tsx src/translations/es/stack.json src/translations/en/stack.json src/lib/main.css
git commit -m "feat: add Nocturne Stack section"
```

---

### Task 8: Projects section

**Files:**
- Create: `src/pages/home/components/projects/projects.data.ts`
- Modify: `src/pages/home/components/projects/project-card.tsx` (full rewrite)
- Modify: `src/pages/home/components/projects/projects.tsx` (full rewrite)
- Delete: none (old translation-driven data in `projects.json` is superseded by `projects.data.ts`, but the JSON files are still updated for the category/section copy)
- Modify: `src/translations/es/projects.json`
- Modify: `src/translations/en/projects.json`

**Interfaces:**
- Produces: `FeaturedProject` and `SecondaryProject` types exported from `projects.data.ts`, consumed by `projects.tsx`.
- Produces: `Projects` component, `id="proyectos"`.

- [ ] **Step 1: Write `projects.data.ts` (placeholders, user edits later)**

```ts
export type FeaturedProject = {
  id: string;
  category: "landing" | "mobile" | "webapp" | "api";
  title: string;
  description: string;
  technologies: string[];
  href: string;
  media?: string;
};

export type SecondaryProject = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "featured-1",
    category: "landing",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["React", "TailwindCSS"],
    href: "#",
  },
  {
    id: "featured-2",
    category: "mobile",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["Kotlin", "Android"],
    href: "#",
  },
  {
    id: "featured-3",
    category: "webapp",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["Next.js", "TypeScript"],
    href: "#",
  },
  {
    id: "featured-4",
    category: "api",
    title: "Nombre del proyecto",
    description: "Descripción corta del proyecto.",
    technologies: ["Node.js", "Docker"],
    href: "#",
  },
];

export const secondaryProjects: SecondaryProject[] = [
  {id: "secondary-1", title: "RubyBox", description: "Inventario y panel de control empresarial.", href: "https://github.com/Im-Fran/rubybox.cl"},
  {id: "secondary-2", title: "Mi UTEM", description: "App móvil para estudiantes UTEM.", href: "https://github.com/exdevutem/mi-utem"},
  {id: "secondary-3", title: "SonatypeCentralUpload", description: "Plugin Gradle para Sonatype Central.", href: "https://github.com/Im-Fran/SonatypeCentralUpload"},
];
```

- [ ] **Step 2: Update `src/translations/es/projects.json`**

```json
{
  "kicker": "Trabajo",
  "title": "Proyectos destacados",
  "view_project": "Ver proyecto",
  "view_all": "Ver todos los proyectos",
  "categories": {
    "landing": "Landing Page",
    "mobile": "Aplicación Móvil",
    "webapp": "Web App",
    "api": "API & Backend"
  }
}
```

- [ ] **Step 3: Update `src/translations/en/projects.json`**

```json
{
  "kicker": "Work",
  "title": "Featured projects",
  "view_project": "View project",
  "view_all": "View all projects",
  "categories": {
    "landing": "Landing Page",
    "mobile": "Mobile App",
    "webapp": "Web App",
    "api": "API & Backend"
  }
}
```

- [ ] **Step 4: Rewrite `project-card.tsx`**

```tsx
import {ArrowUpRight} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import {Card, CardTitle} from "@/components/ui/card.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import type {FeaturedProject} from "@/pages/home/components/projects/projects.data.ts";

export const ProjectCard = ({category, title, description, technologies, href, media}: FeaturedProject) => {
  const {t} = useTranslation();

  return (
    <Card elevation="md" className="reveal-item fs-hoverable overflow-hidden p-0">
      <a href={href} target="_blank" rel="noreferrer" data-fs-hover className="block">
        <div className="h-[260px] w-full bg-neutral-900 flex items-center justify-center text-neutral-700 text-sm">
          {media ? <img src={media} alt={title} className="h-full w-full object-cover"/> : "GIF"}
        </div>
        <div className="p-6">
          <Badge variant="accent" className="mb-3">{t(`projects:categories.${category}`)}</Badge>
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm text-neutral-300 leading-[1.55]">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {technologies.map((tech) => <Badge key={tech} variant="outline">{tech}</Badge>)}
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-accent-300">
            {t("projects:view_project")} <ArrowUpRight size={14}/>
          </span>
        </div>
      </a>
    </Card>
  );
};
```

- [ ] **Step 5: Rewrite `projects.tsx`**

```tsx
import {useRef} from "react";
import {useTranslation} from "react-i18next";
import {ArrowUpRight, Code} from "@phosphor-icons/react";
import {ProjectCard} from "@/pages/home/components/projects/project-card.tsx";
import {featuredProjects, secondaryProjects} from "@/pages/home/components/projects/projects.data.ts";
import {Card, CardBody, CardTitle} from "@/components/ui/card.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

export const Projects = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section id="proyectos" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("projects:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-10">
        {t("projects:title")}
      </h2>

      <div className="reveal-stagger grid gap-6" style={{gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))"}}>
        {featuredProjects.map((project) => <ProjectCard key={project.id} {...project} />)}
      </div>

      <div className="reveal-stagger mt-8 grid gap-6" style={{gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"}}>
        {secondaryProjects.map((project) => (
          <a key={project.id} href={project.href} target="_blank" rel="noreferrer" data-fs-hover>
            <Card elevation="sm" className="reveal-item fs-hoverable h-full">
              <CardBody>
                <Code size={22} className="text-accent-300 mb-3"/>
                <CardTitle className="text-base">{project.title}</CardTitle>
                <p className="mt-2 text-sm text-neutral-400">{project.description}</p>
              </CardBody>
            </Card>
          </a>
        ))}

        <a href="https://github.com/Im-Fran" target="_blank" rel="noreferrer" data-fs-hover>
          <Card elevation="sm" className="reveal-item fs-hoverable h-full border border-accent-700">
            <CardBody className="flex h-full flex-col items-center justify-center text-center">
              <span className="text-sm text-accent-300 inline-flex items-center gap-1">
                {t("projects:view_all")} <ArrowUpRight size={14}/>
              </span>
            </CardBody>
          </Card>
        </a>
      </div>
    </section>
  );
};
```

- [ ] **Step 6: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/pages/home/components/projects src/translations/es/projects.json src/translations/en/projects.json
git commit -m "feat: rebuild Projects section for Nocturne"
```

---

### Task 9: Experience timeline section

**Files:**
- Modify: `src/pages/home/components/experience/experience.tsx` (full rewrite)
- Delete: `src/pages/home/components/experience/experience-card.tsx` (replaced by inline timeline markup — the old card shape doesn't map to the timeline design)
- Modify: `src/translations/es/experience.json` (full rewrite — different shape than before)
- Modify: `src/translations/en/experience.json` (full rewrite)

**Interfaces:**
- Produces: `Experience` component, `id="experiencia"`.

- [ ] **Step 1: Rewrite `src/translations/es/experience.json`**

```json
{
  "kicker": "Trayectoria",
  "title": "Cómo he llegado hasta aquí",
  "milestones": [
    {
      "label": "Inicios",
      "title": "Autodidacta desde cero",
      "description": "Empecé programando por curiosidad, explorando proyectos abiertos y aprendiendo Java y Kotlin sin miedo a equivocarme."
    },
    {
      "label": "Después",
      "title": "Desarrollo Full-Stack",
      "description": "Sumé frontend y backend web, construyendo productos completos de punta a punta."
    },
    {
      "label": "Luego",
      "title": "Móvil, APIs & microservicios",
      "description": "Extendí mi trabajo a apps móviles y arquitecturas de servicios desacoplados y APIs robustas."
    },
    {
      "label": "Hoy",
      "title": "Nuevos desafíos",
      "description": "Sigo aprendiendo tecnologías nuevas y buscando proyectos donde aportar y crecer en equipo."
    }
  ]
}
```

- [ ] **Step 2: Rewrite `src/translations/en/experience.json`**

```json
{
  "kicker": "Journey",
  "title": "How I got here",
  "milestones": [
    {
      "label": "Beginnings",
      "title": "Self-taught from scratch",
      "description": "I started coding out of curiosity, exploring open-source projects and learning Java and Kotlin without fear of getting it wrong."
    },
    {
      "label": "Then",
      "title": "Full-Stack development",
      "description": "I added frontend and web backend, building complete products end to end."
    },
    {
      "label": "Later",
      "title": "Mobile, APIs & microservices",
      "description": "I extended my work to mobile apps and decoupled service architectures with robust APIs."
    },
    {
      "label": "Today",
      "title": "New challenges",
      "description": "I keep learning new technologies and looking for projects where I can contribute and grow as part of a team."
    }
  ]
}
```

- [ ] **Step 3: Delete the old experience card**

```bash
git rm src/pages/home/components/experience/experience-card.tsx
```

- [ ] **Step 4: Rewrite `experience.tsx`**

```tsx
import {useLayoutEffect, useRef} from "react";
import {useTranslation} from "react-i18next";
import gsap from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

gsap.registerPlugin(ScrollTrigger);

type Milestone = { label: string; title: string; description: string };

export const Experience = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef);

  const milestones = t("experience:milestones", {returnObjects: true}) as Milestone[];

  useLayoutEffect(() => {
    if (!timelineRef.current || !lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(lineRef.current, {scaleY: 0, transformOrigin: "top"});
      gsap.to(lineRef.current, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top 70%",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="experiencia" ref={sectionRef} className="container mx-auto px-4 py-24">
      <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
        {t("experience:kicker")}
      </p>
      <h2 className="reveal text-[clamp(30px,4vw,46px)] text-text mb-14">
        {t("experience:title")}
      </h2>

      <div ref={timelineRef} className="relative mx-auto max-w-[760px] pl-10">
        <div
          ref={lineRef}
          className="absolute left-2 top-0 bottom-0 w-px"
          style={{background: "linear-gradient(to bottom, var(--color-accent-600), var(--color-neutral-800))"}}
        />

        <div className="space-y-14">
          {milestones.map((milestone) => (
            <div key={milestone.label} className="reveal relative">
              <span className="absolute -left-10 top-1 h-3 w-3 rounded-full border border-accent-300 bg-bg"/>
              <p className="text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-1">{milestone.label}</p>
              <h3 className="text-lg text-text">{milestone.title}</h3>
              <p className="mt-2 text-sm leading-[1.6] text-neutral-300">{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 5: Verify the build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/pages/home/components/experience src/translations/es/experience.json src/translations/en/experience.json
git commit -m "feat: rebuild Experience timeline for Nocturne"
```

---

### Task 10: Contact section + footer + wire up `home.tsx`

**Files:**
- Create: `src/pages/home/components/contact.tsx`
- Create: `src/translations/es/contact.json`
- Create: `src/translations/en/contact.json`
- Modify: `src/components/footer.tsx` (full rewrite, replaces Task 1's placeholder)
- Modify: `src/pages/home/home.tsx` (final wiring)
- Modify: `src/translations/es/common.json`
- Modify: `src/translations/en/common.json`

**Interfaces:**
- Produces: `Contact` component, `id="contacto"`, renders its own footer content per spec — but the spec's footer row (location + copyright) is visually part of the contact section per the handoff; it's implemented as the last block inside `Contact`, and the app-level `Footer` (rendered by `Layout` on every page) is emptied out since Nocturne has no separate global footer bar.

- [ ] **Step 1: Write `src/translations/es/contact.json`**

```json
{
  "kicker": "Contacto",
  "title": "¿Construyamos algo juntos?",
  "download_cv": "Descargar CV",
  "coming_soon": "Próximamente",
  "location": "Santiago, Chile"
}
```

- [ ] **Step 2: Write `src/translations/en/contact.json`**

```json
{
  "kicker": "Contact",
  "title": "Let's build something together?",
  "download_cv": "Download CV",
  "coming_soon": "Coming soon",
  "location": "Santiago, Chile"
}
```

- [ ] **Step 3: Add the copyright key to `common.json`** (es/en already have `all_rights_reserved`, but it's phrased for the old footer — add a simpler one for Nocturne without touching the old key, since legacy code still reads it)

Edit `src/translations/es/common.json`, add:
```json
"copyright": "© {{year}} Francisco Solís"
```

Edit `src/translations/en/common.json`, add:
```json
"copyright": "© {{year}} Francisco Solís"
```

- [ ] **Step 4: Write `contact.tsx`**

```tsx
import {useRef} from "react";
import {useTranslation} from "react-i18next";
import {GithubLogo, LinkedinLogo, XLogo, InstagramLogo, MapPin} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button/button.tsx";
import {Badge} from "@/components/ui/badge/badge.tsx";
import {useScrollReveal} from "@/pages/home/hooks/useScrollReveal.ts";

const socials = [
  {label: "GitHub", href: "https://github.com/Im-Fran", Icon: GithubLogo},
  {label: "LinkedIn", href: "https://linkedin.com/in/fsolism", Icon: LinkedinLogo},
  {label: "X", href: "https://x.com/Im_Fran_", Icon: XLogo},
  {label: "Instagram", href: "https://instagram.com/fran.dev_", Icon: InstagramLogo},
];

export const Contact = () => {
  const {t} = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section id="contacto" ref={sectionRef} className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{background: "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 18%, transparent), transparent 70%)"}}
      />

      <div className="container relative z-10 mx-auto px-4 py-24">
        <p className="reveal text-[13px] uppercase tracking-[0.08em] text-accent-300 mb-3">
          {t("contact:kicker")}
        </p>
        <h2 className="reveal text-[clamp(32px,5.5vw,64px)] text-text mb-8 max-w-3xl">
          {t("contact:title")}
        </h2>

        <a
          href="mailto:fsolism@franciscosolis.cl"
          data-fs-hover
          className="reveal inline-block border-b border-accent-500 text-2xl sm:text-3xl text-text pb-1 mb-10"
        >
          fsolism@franciscosolis.cl
        </a>

        <div className="reveal flex flex-wrap items-center gap-3">
          {socials.map(({label, href, Icon}) => (
            <Button key={label} asChild variant="ghost" data-fs-hover>
              <a href={href} target="_blank" rel="noreferrer">
                <Icon size={18}/>
                {label}
              </a>
            </Button>
          ))}
          <Button variant="ghost" disabled className="opacity-50 gap-2">
            {t("contact:download_cv")}
            <Badge variant="neutral" size="sm">{t("contact:coming_soon")}</Badge>
          </Button>
        </div>

        <div className="reveal mt-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-neutral-800 pt-6 text-sm text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14}/> {t("contact:location")}
          </span>
          <span>{t("common:copyright", {year: new Date().getFullYear()})}</span>
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 5: Empty out the app-level `Footer`**

Nocturne's footer content lives inside `Contact` (Step 4). The global `Footer` rendered by `Layout` on every route becomes a no-op so there's no duplicate footer bar:

```tsx
const Footer = () => null;

export default Footer;
```

- [ ] **Step 6: Final `home.tsx` wiring**

```tsx
import {Nav} from "@/pages/home/components/nav.tsx";
import {Hero} from "@/pages/home/components/hero.tsx";
import {Stack} from "@/pages/home/components/stack.tsx";
import {Projects} from "@/pages/home/components/projects/projects.tsx";
import {Experience} from "@/pages/home/components/experience/experience.tsx";
import {Contact} from "@/pages/home/components/contact.tsx";

export const Home = () => <>
  <Nav/>
  <Hero/>
  <Stack/>
  <Projects/>
  <Experience/>
  <Contact/>
</>
```

Note: `Skills` and `Certifications` (from the pre-redesign home) are dropped — their content is superseded by the new `Stack` and `Projects` sections per the spec, which doesn't include a separate certifications block. Delete their component files since nothing references them anymore:

```bash
git rm -r src/pages/home/components/skills.tsx src/pages/home/components/certifications
git rm src/translations/es/skills.json src/translations/en/skills.json src/translations/es/certifications.json src/translations/en/certifications.json
```

Remove `'skills'` and `'certifications'` from the `ns` array in `src/main.tsx`, and remove `'github_stats'` too (its only consumer, `GithubStats`, now lives in `src/legacy/` and isn't imported):

```ts
ns: ['common', 'personal_info', 'projects', 'experience', 'hero', 'nav', 'stack', 'contact'],
```

- [ ] **Step 7: Verify the full build**

Run: `pnpm build`
Expected: succeeds with zero TypeScript errors.

Run: `grep -rn "GithubStats\|skills:\|certifications:" src --include='*.tsx' | grep -v '^src/legacy/'`
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Contact section, wire up full Nocturne home page"
```

---

### Task 11: End-to-end manual verification

No new files — this is a verification-only pass, per the spec's testing section (no unit tests for declarative animation/content).

- [ ] **Step 1: Full build**

Run: `pnpm build`
Expected: succeeds.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors (warnings acceptable only if they pre-date this change — check `git stash` diff if unsure).

- [ ] **Step 3: Visual pass with the dev server**

Run `pnpm dev`, open the site in a desktop-sized browser window and walk through:
- Hero entrance animation plays once on load (kicker → h1 → h2 → bio → CTAs, staggered).
- Custom cursor (dot + ring) follows the mouse; ring scales up over nav links, buttons, project cards.
- Scrolling reveals each section's `.reveal`/`.reveal-stagger` content.
- Experience timeline line draws in sync with scroll through that section.
- Language toggle in the nav switches all copy (nav, hero, stack, projects categories, experience, contact) between ES and EN without a page reload.
- Contact section: email link opens a mail client, social buttons open the right profiles in new tabs, "Descargar CV"/"Download CV" button is visibly disabled with the "Próximamente"/"Coming soon" tag.
- Anchor links in the nav scroll smoothly to each section.

- [ ] **Step 4: Mobile/touch check**

Using DevTools device emulation (touch device), confirm: the system cursor is visible (no custom cursor), `document.body.classList` does not contain `fs-cursor-active`, and the grid sections collapse to a single column.

- [ ] **Step 5: Confirm no dangling legacy imports**

Run: `grep -rn "@/legacy" src --include='*.tsx' --include='*.ts' | grep -v '^src/legacy/'`
Expected: no output — legacy code is fully isolated, imported by nothing in the active tree.
