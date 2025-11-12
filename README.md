# Co-Hire-Share EV React

A Vite-powered React application scaffolded with Tailwind CSS v4.1 and an opinionated project structure for building a co-owned EV management platform.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. To create a production build run `npm run build`, then preview with `npm run preview`.

## Project Structure

```
src/
  assets/         Static media files
  components/     Reusable UI building blocks
  hooks/          Custom React hooks
  layouts/        Application-level layouts
  pages/          Route-level views
  styles/         Global and Tailwind stylesheets
  utils/          Shared helpers and constants
```

Global styling enters through `src/styles/globals.css`, which imports the Tailwind v4 preflight, theme tokens, and utilities generated at build time.

## Tailwind CSS v4.1

- Configuration lives in `tailwind.config.js`; update `content` globs as you add new template paths.
- Vite integrates Tailwind through the official `@tailwindcss/vite` plugin declared in `vite.config.js`, so no separate PostCSS config is required.
- Global styles import the framework with `@import "tailwindcss";` inside `src/styles/globals.css`.
- You can extend the design system through the `theme.extend` section and by composing utility classes in your components.

## Linting

Run `npm run lint` to check the codebase with the latest ESLint + React rules bundled with the Vite template.