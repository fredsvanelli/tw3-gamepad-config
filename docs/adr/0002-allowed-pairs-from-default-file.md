# Allowed Pairs come from the default Settings File

The game's default Settings File already puts different Commands on the same Button, with the same Press Type, in the same Game Context (Dodge and Alternate Quen on Circle/B in `[Combat]`). The game resolves these pairs itself, so the Conflict check must accept them. The tool derives the Allowed Pairs from the bundled default file at build time instead of keeping a hand-written list, so the list matches the game's own choices and needs no upkeep when the curated Command list changes.

## Consequences

- An Allowed Pair stays allowed on any Button, not only on the one where the default file places it.
- Replacing the bundled default file (a new game patch) changes the Allowed Pairs with it.
