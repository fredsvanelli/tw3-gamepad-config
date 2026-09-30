import { useEffect, useMemo, useReducer } from 'react'
import defaultText from './data/default-input.settings.txt?raw'
import { COMMANDS, type Locale } from './data/commands'
import type { Button, Layout } from './core/buttons'
import {
  applyAssignment,
  commandContexts,
  computeAllowedPairs,
  findConflicts,
  readAssignment,
  resolveOwnership,
  type Assignment,
  type Conflict,
} from './core/model'
import { parseSettings, serializeSettings } from './core/settingsFile'
import { contextRank, detectLocale } from './i18n/strings'

const defaultFile = parseSettings(defaultText)
const defaultOwnership = resolveOwnership(defaultFile, defaultFile, COMMANDS)
const allowedPairs = computeAllowedPairs(defaultFile, defaultOwnership, COMMANDS)
const defaultRead = readAssignment(defaultFile, defaultOwnership, COMMANDS)

export interface State {
  layout: Layout
  locale: Locale
  /** Text of the imported Settings File; null means the bundled default. */
  baseText: string | null
  sourceName: string | null
  assignment: Assignment
  divergent: string[]
  /** True when there are changes that were not exported. */
  dirty: boolean
}

export type Action =
  | { type: 'pickLayout'; layout: Layout }
  | { type: 'setLocale'; locale: Locale }
  | { type: 'setButton'; commandId: string; button: Button | null }
  | { type: 'load'; text: string; name: string }
  | { type: 'restoreDefault' }
  | { type: 'exported' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'pickLayout':
      return { ...state, layout: action.layout }
    case 'setLocale':
      return { ...state, locale: action.locale }
    case 'setButton':
      return {
        ...state,
        assignment: { ...state.assignment, [action.commandId]: action.button },
        divergent: state.divergent.filter((id) => id !== action.commandId),
        dirty: true,
      }
    case 'load': {
      const file = parseSettings(action.text)
      const read = readAssignment(file, resolveOwnership(file, defaultFile, COMMANDS), COMMANDS)
      return { ...state, baseText: action.text, sourceName: action.name, ...read, dirty: false }
    }
    case 'restoreDefault':
      return { ...state, baseText: null, sourceName: null, ...defaultRead, dirty: false }
    case 'exported':
      return { ...state, dirty: false }
  }
}

const SESSION_KEY = 'tw3gc.session.v1'
const LOCALE_KEY = 'tw3gc.locale'

function initialState(): State {
  const fresh: State = {
    layout: 'xbox',
    locale: detectLocale(),
    baseText: null,
    sourceName: null,
    ...defaultRead,
    dirty: false,
  }
  try {
    const locale = localStorage.getItem(LOCALE_KEY) as Locale | null
    if (locale === 'en' || locale === 'pt' || locale === 'es') fresh.locale = locale
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Partial<State> | null
    if (saved) {
      return {
        ...fresh,
        layout: saved.layout ?? 'xbox',
        baseText: saved.baseText ?? null,
        sourceName: saved.sourceName ?? null,
        // Commands added in a later version start with their default Button.
        assignment: { ...defaultRead.assignment, ...saved.assignment },
        divergent: saved.divergent ?? [],
        dirty: saved.dirty ?? false,
      }
    }
  } catch {
    // Storage can be blocked or hold something unreadable. Start fresh.
  }
  return fresh
}

export interface Derived {
  conflicts: Map<string, Conflict[]>
  exportText: () => string
}

export function useAppState() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => {
    try {
      const { locale, ...session } = state
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      localStorage.setItem(LOCALE_KEY, locale)
    } catch {
      // Saving is a convenience. The app works without it.
    }
  }, [state])

  const base = useMemo(() => {
    const file = state.baseText === null ? defaultFile : parseSettings(state.baseText)
    const ownership = state.baseText === null ? defaultOwnership : resolveOwnership(file, defaultFile, COMMANDS)
    return { file, ownership, contexts: commandContexts(file, ownership) }
  }, [state.baseText])

  const derived: Derived = useMemo(
    () => ({
      conflicts: findConflicts(base.contexts, state.assignment, COMMANDS, allowedPairs, contextRank),
      exportText: () => serializeSettings(applyAssignment(base.file, base.ownership, state.assignment)),
    }),
    [base, state.assignment],
  )

  return { state, dispatch, derived }
}
