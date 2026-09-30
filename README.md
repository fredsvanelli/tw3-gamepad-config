# TW3 Gamepad Config

A browser tool for remapping gamepad buttons in The Witcher 3: Wild Hunt (PC, next-gen update) and exporting the game's `input.settings` file. It runs entirely in the browser and works offline once installed as a PWA.

## How it works

1. Pick PlayStation or Xbox. The choice only changes the button labels; the exported file is the same for both.
2. Change the button of any command. Two commands on the same button, with the same press type, in a situation where both apply, turn red and block the export.
3. Export, close the game, back up your current file, and replace `C:\Users\<your_user>\Documents\The Witcher 3\input.settings`.

You can import your own `input.settings`. Export then rewrites only the gamepad lines of the commands the tool knows and keeps every other line, including mod bindings.

## Development

```sh
npm install
npm run dev      # local server
npm test         # parser, export and conflict tests
npm run build    # production build in dist/
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`. In the repository settings, set Pages to use GitHub Actions as its source.

## Project layout

- `src/data/default-input.settings.txt`: the game's default file, bundled into the app.
- `src/data/commands.ts`: the curated command list, with names, areas, press types and the game actions each command groups.
- `src/core/`: the file parser and writer, and the model that assigns lines to commands and finds conflicts.
- `CONTEXT.md`: the glossary. `docs/adr/`: the design decisions.
