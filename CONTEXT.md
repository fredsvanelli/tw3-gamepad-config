# TW3 Gamepad Config

A browser tool that lets a PC player of The Witcher 3: Wild Hunt remap gamepad buttons and produce the game's `input.settings` file.

## Language

### The game file

**Settings File**:
The `input.settings` text file the game reads from `Documents\The Witcher 3`. The tool imports it and exports it.
_Avoid_: config, input file, profile

**Game Context**:
A bracketed section of the Settings File (`[Exploration]`, `[Combat]`, `[Horse]`) that lists the bindings active while the player is in that situation.
_Avoid_: section, mode, state

**Action**:
A single game input name as written in the Settings File, such as `DrinkPotion1` or `AttackLight`.
_Avoid_: event, input

**Binding**:
One line of the Settings File that ties a Button (or keyboard key) to an Action inside a Game Context.
_Avoid_: mapping, entry

### The tool

**Command**:
One row of the table: a player-facing function with a translated name that groups one or more Actions and gets a single Button across every Game Context where those Actions appear.
_Avoid_: action (reserved for the game's names), control, function

**Button**:
One of the 20 physical gamepad inputs the Settings File names with `IK_Pad_*`, or None.
_Avoid_: key (reserved for keyboard), input

**Press Type**:
Whether a Command fires on a tap, a double tap or a hold. Fixed per Command by the game. The Settings File cannot tell a double tap from a tap, so a double tap Command conflicts with tap Commands.
_Avoid_: state, duration

**Layout**:
The controller family the player picked (PlayStation or Xbox). It changes only the Button labels shown, never the Settings File.
_Avoid_: controller, platform, profile

**Area**:
A heading that groups Commands in the table for reading (General, Exploration, Combat, Horse, Boat, Swimming and Diving, Ciri, Dialogue and Scenes, Photo Mode). Each Command belongs to exactly one Area.
_Avoid_: category, context (reserved for Game Context)

**Mirrored Command**:
A Ciri Action that has a Geralt equivalent (`CiriDodge` for `Dodge`) and always takes the Button of that Geralt Command. It never shows as its own row.
_Avoid_: linked command, copy

**Essential Command**:
A Command the game can't be played without (Interact, Dodge, Menu). Leaving it on None raises a warning.
_Avoid_: required command, mandatory

### Validation

**Conflict**:
Two Commands of the same Area that share a Button and a Press Type and both appear in at least one Game Context, unless they form an Allowed Pair. Commands of different Areas never conflict. A Conflict blocks export.
_Avoid_: clash, collision, duplicate

**Allowed Pair**:
Two different Commands that the game's default Settings File already puts on the same Button, with the same Press Type, in the same Game Context (Dodge and Alternate Quen). They never form a Conflict.
_Avoid_: exception, whitelist

**Warning**:
A problem that is shown but does not block export: an Essential Command on None, or an imported Command whose Actions had different Buttons across Game Contexts.
_Avoid_: soft error, notice
