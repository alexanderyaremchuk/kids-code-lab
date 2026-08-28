# Ratio Rift

An interactive proportional-reasoning adventure for learners around age 11.
It connects ratios, fractions, percentages, unit rates, and scale through 12
short visual missions.

All four sectors and all 12 missions are open from the map, so learners can
explore the concepts in any order.

## Run locally

```bash
npm install
npm run dev
```

Open the exact local URL printed by Vite. Progress is saved in the browser.

On macOS, you can instead double-click `Start Ratio Rift.command`; it starts the
local server and opens the experience. This is required for the Codex in-app
browser, which does not execute application scripts from `file://` pages.

`npm run build` also refreshes `Ratio-Rift.html` for external browsers that
permit scripts in local HTML files.

## Checks

```bash
npm run check
npm test
npm run build
```

## Design choices

- React keeps the challenge mechanics and progress state predictable.
- Framer Motion supplies purposeful state transitions and feedback.
- Canvas Confetti is used sparingly for mission-completion rewards.
- Native SVG, CSS, and semantic controls keep the math crisp, responsive, and
  keyboard accessible.

No account, network service, or personal data is required.
