# UI Component Conventions

This file contains minimal conventions for `src/ui` and `src/components` to keep components consistent.

- Place low-level, reusable components in `src/ui/primitives`.
- Export primitives from `src/ui/index.ts` as named exports.
- Prefer `forwardRef` for interactive primitives; accept `className` and `children` props.
- Keep primitives small and focused (single responsibility).
- Use `cx(...)` from `src/ui/utils.ts` to merge classNames.
- Accessibility: ensure interactive elements have proper ARIA roles and keyboard handling.
- Tests: add a unit test in `tests/` for new primitives using Vitest + Testing Library.

Migration checklist
- Create a PR per component migration.
- Include a Storybook story or a `StyleGuide` example.
- Add a small unit test asserting accessibility roles.
