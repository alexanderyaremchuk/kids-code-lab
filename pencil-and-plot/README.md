# Pencil & Plot

A bright web arcade for eleven classic pencil and tabletop games:

- **Taxman** — a number game about factors and careful greed
- **Square Polyp** — a territorial drawing game on a 9×9 dot grid
- **Crossed** — an eight-line duel where intersections score
- **Dots & Boxes** — close boxes and trigger scoring chains
- **Sprouts** — grow uncrossed vines between limited-capacity dots
- **Sim** — connect six dots without completing your own triangle
- **Factor Game** — choose numbers while your opponent captures factors
- **Matchstick Metro** — lift matches while preserving an exact number of squares
- **Domino Windows** — flip dominoes until all four sides balance
- **Cut & Bloom** — dissect a paper shape with a few straight cuts and rebuild the target silhouette
- **Constellation Sums** — hang numbered stones so every line of a star, triangle, or crystal adds to the same total

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Checks

```bash
npm test
npm run lint
```

The games support mouse, touch, and keyboard input. Sound can be disabled from the header.

The first three rules are adapted from [Math with Bad Drawings](https://mathwithbaddrawings.com/three-quick-games/). The additional games follow references from [MathWorld](https://mathworld.wolfram.com/DotsandBoxes.html), [NRICH](https://nrich.maths.org/games/sprouts), [Beast Academy](https://beastacademy.com/playground/sim), [Michigan State University’s Connected Mathematics Project](https://connectedmath.msu.edu/families/resources-for-families/math-games/factor-game.aspx), and puzzle families from Boris Kordemsky’s [The Moscow Puzzles](https://store.doverpublications.com/products/9780486270784).
