# Agents Guidelines

## Project

This is **npmx-ext**, a browser extension built with [WXT](https://wxt.dev/) and React 19. It redirects npmjs.com pages to npmx.dev. Uses pnpm as the package manager.

## Coding Standards

- **DRY** — Don't Repeat Yourself. Extract shared logic into reusable functions or components.
- **KISS** — Keep It Simple, Stupid. Prefer the simplest solution that works correctly.
- **YAGNI** — You Aren't Gonna Need It. Don't add functionality until it's needed.
- Use `kebab-case` for file names.
- Prefer `function` declarations over `const` arrow functions.
- Use `T[]` instead of `Array<T>`.
- Write idiomatic React — hooks, functional components, composition over inheritance.

## WXT Framework

- Entrypoints live in `src/entrypoints/` (background, content, popup).
- WXT auto-discovers entrypoints by file name convention. See [WXT docs](https://wxt.dev/).
- Use `wxt/storage` for extension storage.
- Manifest permissions are configured in `wxt.config.ts`.
- Path alias `@` maps to `./src`.

## UI — shadcn/ui + React

- UI components are in `src/components/ui/` and follow the shadcn/ui "new-york" style.
- Add new components with `pnpm dlx shadcn@latest add <component>`.
- Use Tailwind CSS utility classes for styling — avoid inline styles and CSS modules.
- Icons come from `lucide-react`.
- Use the `cn()` helper from `@/lib/utils` for conditional class names.

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Use `pnpm commit` to launch the interactive Commitizen prompt.

## Linting & Formatting

- Lint: `pnpm lint` / `pnpm lint:fix` (oxlint)
- Format: `pnpm fmt` / `pnpm fmt:check` (oxfmt)

Run both before committing.
