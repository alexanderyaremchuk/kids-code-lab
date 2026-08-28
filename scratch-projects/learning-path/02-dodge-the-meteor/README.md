# Lesson 2: Dodge the Meteor

## Goal

Move the spaceship left and right, dodge the falling meteor, and protect three
lives. Each meteor that passes safely earns one point.

Open [Lesson 02 - Dodge the Meteor.sb3](Lesson%2002%20-%20Dodge%20the%20Meteor.sb3)
in Scratch using **File → Load from your computer**.

## Blocks to notice

- **change y by -8** makes the meteor fall;
- **y position < -165** detects when it has passed the ship;
- **touching Explorer Ship?** detects a collision;
- **Score**, **Lives**, and **Playing** remember the game state;
- **if / else** chooses between resetting the meteor and ending the game;
- **wait 0.05 seconds** controls the animation speed.

## First modification

Change the meteor's falling amount from `-8` to `-12`. Predict whether that
makes the game easier or harder, then test it.

## Extra challenges

1. Start with five lives instead of three.
2. Make a safe meteor worth two points.
3. Draw a different meteor costume.
4. Change the random x-position range to make the meteor stay nearer the
   centre.

## Quick check

- Why is a small **wait** block needed inside the forever loop?
- Which comparison detects that the meteor left the bottom of the stage?
- What does the **Playing** variable prevent after the last life is lost?
