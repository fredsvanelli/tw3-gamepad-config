import { isButton, NONE_KEY, type Button } from './buttons'
import type { BindingLine, SettingsFile } from './settingsFile'
import type { Command } from '../data/commands'

export type Assignment = Record<string, Button | null>

interface Ref {
  commandId: string
  defaultButton?: Button
}

const groupKey = (action: string, hold: boolean) => `${action}|${hold ? 'hold' : 'tap'}`
const isPad = (key: string) => key.startsWith('IK_Pad_')

function buildRefIndex(commands: Command[]): Map<string, Ref[]> {
  const index = new Map<string, Ref[]>()
  for (const command of commands) {
    for (const entry of command.actions) {
      const ref = typeof entry === 'string' ? { action: entry } : entry
      const key = groupKey(ref.action, command.press === 'hold')
      const refs = index.get(key) ?? []
      refs.push({ commandId: command.id, defaultButton: ref.defaultButton })
      index.set(key, refs)
    }
  }
  return index
}

/** Bindings grouped by Game Context, then by Action and Press Type, in file order. */
function groupBindings(file: SettingsFile, refIndex: Map<string, Ref[]>) {
  const groups = new Map<string, Map<string, number[]>>()
  file.lines.forEach((line, i) => {
    if (line.kind !== 'binding') return
    if (!isPad(line.key) && line.key !== NONE_KEY) return
    const key = groupKey(line.action, line.hold)
    if (!refIndex.has(key)) return
    const byAction = groups.get(line.context) ?? new Map<string, number[]>()
    const indices = byAction.get(key) ?? []
    indices.push(i)
    byAction.set(key, indices)
    groups.set(line.context, byAction)
  })
  return groups
}

/** Which Command owns each gamepad Binding line of a Settings File, by line index. */
export type Ownership = Map<number, string>

/**
 * Assigns the gamepad Bindings of `file` to Commands. The default file tells how
 * many gamepad Bindings each Action has per Game Context. When a file has fewer
 * (because export wrote `IK_None` for a Command on None), `IK_None` lines of the
 * same Action fill the gap, picked at the positions where the default file has
 * gamepad lines, so None survives a round trip without claiming the keyboard's
 * own unbound lines.
 */
export function resolveOwnership(file: SettingsFile, defaultFile: SettingsFile, commands: Command[]): Ownership {
  const refIndex = buildRefIndex(commands)
  const defaults = groupBindings(defaultFile, refIndex)
  const owned: Ownership = new Map()
  const lineKey = (i: number) => (file.lines[i] as BindingLine).key
  const defaultKey = (i: number) => (defaultFile.lines[i] as BindingLine).key

  interface Group {
    refs: Ref[]
    candidates: number[]
    /** Gamepad Bindings each ref had in the default file for this Game Context. */
    capacity: number[]
  }
  const simple: Group[] = []
  const shared: Group[] = []

  for (const [context, byAction] of groupBindings(file, refIndex)) {
    const defaultByAction = defaults.get(context)
    for (const [key, indices] of byAction) {
      const refs = refIndex.get(key)!
      const pads = indices.filter((i) => isPad(lineKey(i)))
      const defaultIndices = defaultByAction?.get(key) ?? []
      const defaultPads = defaultIndices.filter((i) => isPad(defaultKey(i)))
      const need = defaultByAction ? Math.max(0, defaultPads.length - pads.length) : 0

      const fill: number[] = []
      if (need > 0) {
        const padPositions = new Set(defaultIndices.flatMap((i, k) => (isPad(defaultKey(i)) ? [k] : [])))
        const nones = indices.map((i, k) => ({ i, k })).filter(({ i }) => lineKey(i) === NONE_KEY)
        nones.sort((a, b) => Number(padPositions.has(b.k)) - Number(padPositions.has(a.k)))
        fill.push(...nones.slice(0, need).map(({ i }) => i))
      }
      const candidates = [...pads, ...fill].sort((a, b) => a - b)
      const capacity = refs.map((ref) =>
        !defaultByAction || !ref.defaultButton
          ? Infinity
          : defaultPads.filter((i) => defaultKey(i) === ref.defaultButton).length,
      )
      const group = { refs, candidates, capacity }
      if (refs.length === 1 && !refs[0].defaultButton) simple.push(group)
      else shared.push(group)
    }
  }

  for (const { refs, candidates } of simple) for (const i of candidates) owned.set(i, refs[0].commandId)

  // An Action bound to two Buttons at once (SwordSheathe) goes to the Command whose
  // other Actions already sit on that Button, then to the one that had it by default,
  // then in file order.
  const provisional = majorityKeys(file, owned)
  for (const { refs, candidates, capacity } of shared) {
    const remaining = new Set(candidates)
    const claim = (preferred: (ref: Ref) => string | undefined) =>
      refs.forEach((ref, r) => {
        const wanted = preferred(ref)
        for (const i of candidates) {
          if (capacity[r] === 0 || wanted === undefined) break
          if (remaining.has(i) && lineKey(i) === wanted) {
            owned.set(i, ref.commandId)
            remaining.delete(i)
            capacity[r]--
          }
        }
      })
    claim((ref) => provisional.get(ref.commandId))
    claim((ref) => ref.defaultButton)
    for (const i of remaining) {
      const r = capacity.findIndex((c) => c > 0)
      owned.set(i, refs[Math.max(0, r)].commandId)
      if (r >= 0) capacity[r]--
    }
  }
  return owned
}

/** The key most of each Command's Bindings use. */
function majorityKeys(file: SettingsFile, ownership: Ownership): Map<string, string> {
  const counts = keyCounts(file, ownership)
  return new Map([...counts].map(([id, byKey]) => [id, [...byKey].sort((a, b) => b[1] - a[1])[0][0]]))
}

function keyCounts(file: SettingsFile, ownership: Ownership): Map<string, Map<string, number>> {
  const counts = new Map<string, Map<string, number>>()
  for (const [i, commandId] of ownership) {
    const key = (file.lines[i] as BindingLine).key
    const byKey = counts.get(commandId) ?? new Map<string, number>()
    byKey.set(key, (byKey.get(key) ?? 0) + 1)
    counts.set(commandId, byKey)
  }
  return counts
}

export interface ReadResult {
  assignment: Assignment
  /** Commands whose Bindings had different Buttons across Game Contexts. */
  divergent: string[]
}

export function readAssignment(file: SettingsFile, ownership: Ownership, commands: Command[]): ReadResult {
  const counts = keyCounts(file, ownership)
  const majority = majorityKeys(file, ownership)
  const assignment: Assignment = {}
  const divergent: string[] = []
  for (const command of commands) {
    const byKey = counts.get(command.id)
    if (!byKey) {
      assignment[command.id] = null
      continue
    }
    const top = majority.get(command.id)!
    assignment[command.id] = isButton(top) ? top : null
    if (byKey.size > 1) divergent.push(command.id)
  }
  return { assignment, divergent }
}

/** Rewrites only the keys of owned gamepad Bindings. Every other line stays as it was. */
export function applyAssignment(file: SettingsFile, ownership: Ownership, assignment: Assignment): SettingsFile {
  const lines = file.lines.map((line, i) => {
    const commandId = ownership.get(i)
    if (commandId === undefined || line.kind !== 'binding') return line
    return { ...line, key: assignment[commandId] ?? NONE_KEY }
  })
  return { ...file, lines }
}

/** Game Contexts where each Command has at least one Binding. */
export function commandContexts(file: SettingsFile, ownership: Ownership): Map<string, Set<string>> {
  const contexts = new Map<string, Set<string>>()
  for (const [i, commandId] of ownership) {
    const set = contexts.get(commandId) ?? new Set<string>()
    set.add((file.lines[i] as BindingLine).context)
    contexts.set(commandId, set)
  }
  return contexts
}

const pairKey = (a: string, b: string) => (a < b ? `${a}+${b}` : `${b}+${a}`)

/** Commands sharing a Button and Press Type inside each Game Context. */
function sharedSlots(
  contexts: Map<string, Set<string>>,
  assignment: Assignment,
  commands: Command[],
): Map<string, Map<string, string[]>> {
  const holds = new Map<string, boolean>(commands.map((c) => [c.id, c.press === 'hold']))
  const byContext = new Map<string, Map<string, string[]>>()
  for (const [commandId, set] of contexts) {
    const button = assignment[commandId]
    if (!button) continue
    for (const context of set) {
      const slots = byContext.get(context) ?? new Map<string, string[]>()
      const slot = `${button}|${holds.get(commandId) ? 'hold' : 'tap'}`
      slots.set(slot, [...(slots.get(slot) ?? []), commandId])
      byContext.set(context, slots)
    }
  }
  return byContext
}

/** Pairs of Commands the default file already puts on one Button, Press Type and Game Context. */
export function computeAllowedPairs(
  defaultFile: SettingsFile,
  ownership: Ownership,
  commands: Command[],
): Set<string> {
  const { assignment } = readAssignment(defaultFile, ownership, commands)
  const allowed = new Set<string>()
  for (const slots of sharedSlots(commandContexts(defaultFile, ownership), assignment, commands).values()) {
    for (const ids of slots.values()) {
      for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) allowed.add(pairKey(ids[a], ids[b]))
    }
  }
  return allowed
}

export interface Conflict {
  otherId: string
  context: string
}

export function findConflicts(
  contexts: Map<string, Set<string>>,
  assignment: Assignment,
  commands: Command[],
  allowedPairs: Set<string>,
  contextRank: (context: string) => number,
): Map<string, Conflict[]> {
  const area = new Map(commands.map((c) => [c.id, c.area]))
  const found = new Map<string, Map<string, string>>()
  for (const [context, slots] of sharedSlots(contexts, assignment, commands)) {
    for (const ids of slots.values()) {
      for (const a of ids) {
        for (const b of ids) {
          // Commands only conflict with Commands of their own Area.
          if (a === b || area.get(a) !== area.get(b) || allowedPairs.has(pairKey(a, b))) continue
          const byOther = found.get(a) ?? new Map<string, string>()
          const current = byOther.get(b)
          if (current === undefined || contextRank(context) < contextRank(current)) byOther.set(b, context)
          found.set(a, byOther)
        }
      }
    }
  }
  const result = new Map<string, Conflict[]>()
  for (const [id, byOther] of found) {
    result.set(id, [...byOther].map(([otherId, context]) => ({ otherId, context })))
  }
  return result
}
