# Phase 2 — Design System & Theming (Plan)

Goal

- Create a single source of truth for colors, spacing, typography and UI primitives so the app is visually consistent, themeable (dark/light), and accessible.

High-level approach

1. Install and configure TailwindCSS to manage tokens and utility classes.
2. Define design tokens as both Tailwind theme extensions and CSS variables (for runtime theming).
3. Add a `src/ui/primitives` folder with typed React primitives (Button, Input, Card, Badge, Dialog, Select, Slider, Textarea, Tooltip).
4. Add Storybook (or an alternative component explorer) to preview primitives and document tokens.
5. Provide a small style guide page and token documentation.

Important notes / constraints

- We already have `index.css` with Tailwind directives present, but Tailwind packages may not be installed. Phase 2 will ensure proper Tailwind setup.
- Keep changes isolated: create `src/ui` and `src/styles` for tokens and primitives only. Do not refactor all components yet — implement primitives and replace gradually.

Tasks (detailed)

- Task A: Tailwind setup
  - Install dev deps: `tailwindcss`, `postcss`, `autoprefixer`.
  - Initialize Tailwind: `npx tailwindcss init -p`.
  - Update `tailwind.config.js` to extend theme with tokens (colors, fontFamily, spacing, animations).
  - Ensure `src/index.css` includes Tailwind directives and imports token CSS variables.

  Example `tailwind.config.js` snippet:

  ```js
  module.exports = {
    darkMode: ['class'],
    content: ['./src/**/*.{ts,tsx,js,jsx}'],
    theme: {
      extend: {
        colors: {
          primary: '#6366f1',
          accent: '#ec4899',
          'bg-base': '#0f0f13',
          'bg-surface': '#18181f',
          'bg-card': '#1e1e28',
          'text-primary': '#f1f1f5',
          'text-muted': '#8b8ba0',
        },
        fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      },
    },
    plugins: [],
  };
  ```

- Task B: CSS variables for runtime theming
  - Create `src/styles/tokens.css` with variables for colors, radii, spacing, and map them to Tailwind where useful.
  - Provide `:root` and `.dark` variants so runtime theme switching is simple.

  Example `tokens.css` snippet:
  ```css
  :root {
    --color-primary: #6366f1;
    --color-accent: #ec4899;
    --bg-base: #0f0f13;
    --bg-surface: #18181f;
    --bg-card: #1e1e28;
    --text-primary: #f1f1f5;
    --text-muted: #8b8ba0;
    --radius-md: 8px;
  }

  .dark {
    --bg-base: #060708; /* alternate tokens if needed */
  }
  ```

- Task C: UI primitives skeletons
  - Create `src/ui/primitives/Button.tsx`, `Input.tsx`, `Card.tsx`, `Badge.tsx`, `Dialog.tsx`, `Select.tsx`, `Slider.tsx`, `Textarea.tsx`, `Tooltip.tsx`.
  - Each primitive should be small, typed (TypeScript), and have props for `className`, `variant`, and accessibility props.

  Example `Button.tsx` (plan snippet):
  ```tsx
  import React from 'react';
  import clsx from 'clsx';

  export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger';
  };

  export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
    const base = 'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2';
    const v = variant === 'primary' ? 'bg-primary text-white hover:opacity-95' : 'bg-white/5 text-text-primary';
    return <button className={clsx(base, v, className)} {...rest} />;
  }

  export default Button;
  ```

- Task D: Storybook (optional but recommended)
  - Initialize Storybook with `npx sb@next init` or `npx storybook init` depending on choice.
  - Add stories for each primitive demonstrating variants and accessibility states.

- Task E: Documentation and sample pages
  - Add `docs/design-tokens.md` or a simple `src/pages/styleguide` with token table, example components, and usage notes.

- Task F: Migration plan
  - List components to migrate first (buttons, inputs, cards, result cards) and create PRs per component.

Files to create (implementation will wait for your approval)

- `tailwind.config.js` (or update existing)
- `postcss.config.js` (if missing)
- `src/styles/tokens.css`
- `src/ui/primitives/Button.tsx` (and other primitives)
- `src/ui/index.ts` (exports primitives)
- `storybook` config files (optional)
- `docs/design-tokens.md` or `src/pages/styleguide/index.tsx`

Validation steps (after I implement, what you'll run)

1. Install packages and run dev server

```powershell
cd "c:\Gen AI\Resume-AI-RAG\recruitbot-web"
npm install
npm run dev
```

2. Confirm Tailwind utilities apply
- Open the app and inspect an element using a Tailwind class added by a primitive (e.g., `bg-primary`). If class applies and color matches tokens, good.

3. Confirm CSS variables available
- In browser console, run `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` and expect the token value.

4. Storybook (if enabled)
```powershell
npm run storybook
# open Storybook URL and verify Button/Input stories
```

Acceptance criteria

- `tailwind.config.js` present with token extensions.
- `src/styles/tokens.css` defines CSS variables and a `.dark` variant.
- At least one primitive (`Button`) implemented and exported from `src/ui`.
- Storybook shows the primitive (if configured).
- A short styleguide page lists color tokens and usage.

Estimate & phasing

- Tailwind + tokens + tokens.css + Button primitive + styleguide: 1 day (small PR)
- Full primitives set + Storybook: 1–2 days
- Gradual migration of UI components: iterative PRs (one component per PR recommended)

What I will do next after you approve

- Implement Task A, B and create `Button` primitive (small PR) and the styleguide page.
- Provide exact files changed and the validation commands you can run locally.

---

Reply with **"Approve Phase 2"** to start implementation, or ask for changes to this plan.