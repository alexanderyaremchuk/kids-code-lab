# Kids Code Lab

A collection of playful coding and maths projects for kids. One clone contains
the complete source, build files, tests, standalone files, and Scratch projects.

## Get everything

```bash
git clone https://github.com/alexanderyaremchuk/kids-code-lab.git
cd kids-code-lab
```

## Projects

| Folder | What it contains | How to start |
| --- | --- | --- |
| [`pencil-and-plot/`](pencil-and-plot/) | Thirteen pencil-and-tabletop maths games, with source and tests | `npm install && npm run dev` |
| [`ratio-rift/`](ratio-rift/) | A 12-mission ratios, fractions, and percentages adventure | `npm install && npm run dev` |
| [`scratch-projects/`](scratch-projects/) | Scratch animations, a fractions game, and five guided coding lessons | Load a `.sb3` file in Scratch |

Each folder has its own README with instructions and learning goals.

## Scratch projects

1. Open the [Scratch editor](https://scratch.mit.edu/projects/editor/).
2. Choose **File -> Load from your computer**.
3. Select any `.sb3` file from `scratch-projects/`.

## Verify the web projects

```bash
cd pencil-and-plot
npm install
npm test
npm run lint

cd ../ratio-rift
npm install
npm run check
npm test
npm run build
```

Installed packages and temporary build caches are intentionally not stored in
Git. `npm install` restores them from each project's lockfile.
