# npmx-ext

Browser extension that redirects npmjs.com package pages to [npmx.dev](https://npmx.dev) for a better browsing experience.

## Features

- Automatically redirects npm package URLs to npmx.dev
- Supports Chrome and Firefox
- Toggle redirection on/off from the popup
- Exclude specific sites or URL patterns from redirection
- Pattern matching: domains (`example.com`), wildcards (`*.example.com`), keywords, and paths

## Installation

### From source (development)

**Prerequisites:** [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)

1. Clone the repository:

   ```sh
   git clone https://github.com/felipevaa/npmx-ext.git
   cd npmx-ext
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Start the dev server:

   ```sh
   # Chrome
   pnpm dev

   # Firefox
   pnpm dev:firefox
   ```

   This opens a browser with the extension loaded and hot-reloads on changes.

### Loading a production build

1. Build the extension:

   ```sh
   # Chrome
   pnpm build

   # Firefox
   pnpm build:firefox
   ```

2. Load in your browser:

   **Chrome:**
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `.output/chrome-mv3` directory

   **Firefox:**
   - Go to `about:debugging#/runtime/this-firefox`
   - Click **Load Temporary Add-on** and select any file inside `.output/firefox-mv2`

### Packaged zip

```sh
# Chrome
pnpm zip

# Firefox
pnpm zip:firefox
```

The `.zip` file will be created in the `.output` directory, ready for distribution or store submission.

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Dev server (Chrome)          |
| `pnpm dev:firefox`   | Dev server (Firefox)         |
| `pnpm build`         | Production build (Chrome)    |
| `pnpm build:firefox` | Production build (Firefox)   |
| `pnpm zip`           | Package extension (Chrome)   |
| `pnpm zip:firefox`   | Package extension (Firefox)  |
| `pnpm lint`          | Lint with oxlint             |
| `pnpm lint:fix`      | Lint and auto-fix            |
| `pnpm fmt`           | Format with oxfmt            |
| `pnpm fmt:check`     | Check formatting             |
| `pnpm commit`        | Create a conventional commit |

## Tech Stack

- [WXT](https://wxt.dev/) — Web extension framework
- [React 19](https://react.dev/) — UI library
- [shadcn/ui](https://ui.shadcn.com/) — Component library (New York style)
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [oxlint](https://oxc.rs/) / [oxfmt](https://oxc.rs/) — Linting and formatting
- [Commitizen](https://commitizen-tools.github.io/commitizen/) — Conventional commits

## License

[MIT](LICENSE)
