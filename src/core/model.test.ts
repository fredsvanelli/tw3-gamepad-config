import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COMMANDS, UNMANAGED_ACTIONS } from '../data/commands'
import { isButton } from './buttons'
import {
  applyAssignment,
  commandContexts,
  computeAllowedPairs,
  findConflicts,
  readAssignment,
  resolveOwnership,
} from './model'
import { parseSettings, serializeSettings, type BindingLine } from './settingsFile'

const defaultText = readFileSync(new URL('../data/default-input.settings.txt', import.meta.url), 'utf8')
const defaultFile = parseSettings(defaultText)
const defaultOwnership = resolveOwnership(defaultFile, defaultFile, COMMANDS)
const allowed = computeAllowedPairs(defaultFile, defaultOwnership, COMMANDS)

function load(text: string) {
  const file = parseSettings(text)
  const ownership = resolveOwnership(file, defaultFile, COMMANDS)
  return { file, ownership, ...readAssignment(file, ownership, COMMANDS) }
}

function exportWith(text: string, changes: Record<string, string | null>) {
  const { file, ownership, assignment } = load(text)
  return serializeSettings(applyAssignment(file, ownership, { ...assignment, ...changes } as never))
}

function conflictsOf(text: string, changes: Record<string, string | null> = {}) {
  const { file, ownership, assignment } = load(text)
  const next = { ...assignment, ...changes } as never
  return findConflicts(commandContexts(file, ownership), next, COMMANDS, allowed, () => 0)
}

describe('default Settings File', () => {
  it('parses every IK_ line as a Binding', () => {
    const rawBindings = defaultText.split('\r\n').filter((l) => l.startsWith('IK_')).length
    expect(defaultFile.lines.filter((l) => l.kind === 'binding')).toHaveLength(rawBindings)
  })

  it('round-trips byte for byte without changes', () => {
    expect(serializeSettings(defaultFile)).toBe(defaultText)
    expect(exportWith(defaultText, {})).toBe(defaultText)
  })

  it('gives every gamepad Binding to a Command unless its Action is unmanaged', () => {
    const orphans = defaultFile.lines
      .map((line, i) => ({ line, i }))
      .filter(({ line, i }) => line.kind === 'binding' && line.key.startsWith('IK_Pad_') && !defaultOwnership.has(i))
      .map(({ line }) => (line as BindingLine).action)
      .filter((action) => !UNMANAGED_ACTIONS.includes(action))
    expect([...new Set(orphans)]).toEqual([])
  })

  it('never lets a Command own a keyboard Binding', () => {
    for (const i of defaultOwnership.keys()) {
      expect((defaultFile.lines[i] as BindingLine).key).toMatch(/^IK_Pad_/)
    }
  })

  it('gives every Command a Button and one Button only', () => {
    const { assignment, divergent } = load(defaultText)
    expect(divergent).toEqual([])
    for (const command of COMMANDS) expect(isButton(assignment[command.id] ?? ''), command.id).toBe(true)
  })

  it('has no Conflicts', () => {
    expect(conflictsOf(defaultText).size).toBe(0)
  })
})

describe('export', () => {
  it('changes only the gamepad lines of the changed Command', () => {
    const out = exportWith(defaultText, { potionUpper: 'IK_Pad_LeftShoulder' }).split('\r\n')
    const before = defaultText.split('\r\n')
    const changed = before.map((line, i) => [line, out[i]]).filter(([a, b]) => a !== b)
    expect(changed.length).toBeGreaterThan(0)
    for (const [a, b] of changed) {
      expect(a).toBe('IK_Pad_DigitUp=(Action=DrinkPotion1)')
      expect(b).toBe('IK_Pad_LeftShoulder=(Action=DrinkPotion1)')
    }
  })

  it('keeps None through a round trip and restores the Button afterwards', () => {
    const unbound = exportWith(defaultText, { callHorse: null })
    expect(unbound).not.toContain('IK_Pad_LeftThumb=(Action=SpawnHorse)')
    expect(load(unbound).assignment.callHorse).toBeNull()
    expect(exportWith(unbound, { callHorse: 'IK_Pad_LeftThumb' })).toBe(defaultText)
  })

  it('does not claim the keyboard unbound line of an Action', () => {
    // BASE_CharacterMovementWithSprint has IK_None=(Action=SprintToggle) for the keyboard.
    const unbound = exportWith(defaultText, { sprintToggle: null })
    const rebound = exportWith(unbound, { sprintToggle: 'IK_Pad_LeftThumb' })
    expect(rebound).toBe(defaultText)
  })

  it('keeps the two sheathe Bindings apart when the swords swap sides', () => {
    const swapped = exportWith(defaultText, {
      steelSword: 'IK_Pad_DigitRight',
      silverSword: 'IK_Pad_DigitLeft',
      sheatheSteel: 'IK_Pad_DigitRight',
      sheatheSilver: 'IK_Pad_DigitLeft',
    })
    const { assignment, divergent } = load(swapped)
    expect(divergent).toEqual([])
    expect(assignment.steelSword).toBe('IK_Pad_DigitRight')
    expect(new Set([assignment.sheatheSteel, assignment.sheatheSilver])).toEqual(
      new Set(['IK_Pad_DigitLeft', 'IK_Pad_DigitRight']),
    )
  })

  it('writes CRLF even when the imported file used LF', () => {
    const lf = defaultText.replaceAll('\r\n', '\n')
    expect(exportWith(lf, {})).toBe(defaultText)
  })

  it('keeps lines it does not know', () => {
    const modded = `${defaultText}[MyMod]\r\nIK_Pad_A_CROSS=(Action=ModThing)\r\n; comment\r\n`
    expect(exportWith(modded, { interact: 'IK_Pad_X_SQUARE' })).toContain(
      '[MyMod]\r\nIK_Pad_A_CROSS=(Action=ModThing)\r\n; comment\r\n',
    )
  })
})

describe('import', () => {
  it('flags a Command whose Buttons differ across Game Contexts', () => {
    const edited = defaultText.replace(/(\[Horse\][\s\S]*?)IK_Pad_DigitUp=\(Action=DrinkPotion1\)/, '$1IK_Pad_RightShoulder=(Action=DrinkPotion1)')
    const { assignment, divergent } = load(edited)
    expect(divergent).toEqual(['potionUpper'])
    expect(assignment.potionUpper).toBe('IK_Pad_DigitUp')
  })
})

describe('conflicts', () => {
  it('flags two Commands on one Button and Press Type in a shared Game Context', () => {
    const conflicts = conflictsOf(defaultText, { potionUpper: 'IK_Pad_Y_TRIANGLE' })
    expect(conflicts.get('potionUpper')?.map((c) => c.otherId)).toContain('attackHeavy')
    expect(conflicts.get('attackHeavy')?.map((c) => c.otherId)).toContain('potionUpper')
  })

  it('ignores a different Press Type on the same Button', () => {
    expect(conflictsOf(defaultText, { potionUpperSwap: 'IK_Pad_LeftShoulder' }).size).toBe(0)
  })

  it('ignores Commands that never share a Game Context', () => {
    // Gallop only exists on horseback, Whirl never does.
    expect(conflictsOf(defaultText, { gallop: 'IK_Pad_X_SQUARE' }).size).toBe(0)
  })

  it('ignores Commands on None', () => {
    expect(conflictsOf(defaultText, { potionUpper: null, attackHeavy: null }).size).toBe(0)
  })

  it('accepts Allowed Pairs on any Button', () => {
    expect(allowed.has('altQuen+dodge')).toBe(true)
    expect(conflictsOf(defaultText, { dodge: 'IK_Pad_LeftShoulder', altQuen: 'IK_Pad_LeftShoulder' }).get('dodge')
      ?.map((c) => c.otherId)).not.toContain('altQuen')
  })
})
