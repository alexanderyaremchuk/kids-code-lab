# Lesson 4: Neon Maze Escape

## Goal

Guide the robot from the blue start circle to the green goal. Touching a pink
wall returns the robot to the start and increases the **Bumps** counter.

Open [Lesson 04 - Neon Maze Escape.sb3](Lesson%2004%20-%20Neon%20Maze%20Escape.sb3)
in Scratch using **File → Load from your computer**.

## New concepts

- **touching color?** lets a sprite react to pixels in the backdrop;
- the backdrop is part of the game's rules, not only decoration;
- x and y coordinates define the start and goal locations;
- **and** combines two conditions: the game is active and a colour is touched;
- a hidden **Playing** variable disables movement after winning;
- the **Bumps** variable records mistakes without ending the game.

## First modification

Change the movement amount from `10` to `20`. Predict what becomes easier and
what new problem appears when the robot takes larger steps.

## Extra challenges

1. Paint an additional pink wall and test whether sensing finds it.
2. Move the green goal to a new location.
3. Add a second checkpoint colour and a checkpoint message.
4. Try to finish with fewer than three bumps.

## Quick check

- Why must the sensing block use exactly the same pink as the maze walls?
- Which blocks send the robot back to the starting coordinates?
- Why does movement stop after the robot reaches green?
