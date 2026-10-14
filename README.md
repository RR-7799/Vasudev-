# Vasudev 1.0

**A screenplay-first filmmaking workspace.** Write a script once, then carry its scene structure into pre-production.

## Included workflows

- **Screenplay editor:** scene/action/character/dialogue/parenthetical/transition/shot blocks, keyboard formatting shortcuts, scene management, undo/redo, and print/PDF through the browser.
- **Project data:** local autosave, recent-project snapshots, JSON project import/export, and editable project metadata.
- **Pre-production:** character and location tracking, scene breakdown, shot lists, storyboard prompt preparation, shooting schedule, budget, call sheets, and crew records.
- **Quality and planning:** script checks, scene-linked notes, continuity view, and project dashboard.

## Run locally

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To create the static site used by the current desktop/mobile wrappers:

```bash
npm run build
```

The production build exports the site to `out/`. The app can also be type-checked with `npx tsc --noEmit`.

## Data and privacy

Project data is stored in the browser on the device where you work. Use **Save / Export** to keep a portable `.vasudev.json` backup and **Open / Import** to restore it. Browser storage is not cloud sync: clearing browser data or changing devices can remove access to local projects, so keep backups.

## CI

GitHub Actions runs TypeScript checking and the production build on pushes and pull requests targeting `main`.

## Product principle

**Write once → everything else connects to the screenplay.**

Vasudev currently focuses on a dependable web workflow. AI image generation, cloud collaboration, and desktop packaging should be treated as separate future milestones rather than prerequisites for writing and planning.
