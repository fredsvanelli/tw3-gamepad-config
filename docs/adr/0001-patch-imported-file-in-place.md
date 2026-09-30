# Export patches the imported Settings File in place

Export takes the imported Settings File (or the bundled default) as its base and rewrites only the `IK_Pad_*` Bindings of the Actions that belong to known Commands. Everything else stays as it was: section order, keyboard Bindings, unknown Game Contexts, Actions added by mods, and CRLF line endings. Generating the file from scratch out of the Command list would be simpler, but it would silently delete mod Bindings and every Action the tool does not model.

## Consequences

- Importing the default file and exporting it unchanged must produce a byte-identical file. A test enforces this.
- The parser has to keep every line it does not understand, not only the ones it models.
