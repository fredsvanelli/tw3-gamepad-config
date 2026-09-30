// Line-preserving reader and writer for the game's input.settings file.
// Every line is kept verbatim; only Binding lines are split into key and body
// so that export can swap the key without touching anything else.

export interface BindingLine {
  kind: 'binding'
  context: string
  key: string
  /** Everything after `KEY=`, e.g. `(Action=DrinkPotion1,State=Duration,IdleTime=0.3)` */
  body: string
  action: string
  hold: boolean
}

export interface OtherLine {
  kind: 'other'
  raw: string
}

export type Line = BindingLine | OtherLine

export interface SettingsFile {
  lines: Line[]
  endsWithNewline: boolean
}

const SECTION_RE = /^\[([^\]]+)\]$/
const BINDING_RE = /^(IK_[A-Za-z0-9_]+)=(\(Action=([A-Za-z0-9_]+)[^)]*\))$/

export function parseSettings(text: string): SettingsFile {
  const endsWithNewline = /\r?\n$/.test(text)
  const body = endsWithNewline ? text.replace(/\r?\n$/, '') : text
  const lines: Line[] = []
  let context = ''
  for (const raw of body.split(/\r?\n/)) {
    const section = SECTION_RE.exec(raw)
    if (section) {
      context = section[1]
      lines.push({ kind: 'other', raw })
      continue
    }
    const binding = context ? BINDING_RE.exec(raw) : null
    if (binding) {
      lines.push({
        kind: 'binding',
        context,
        key: binding[1],
        body: binding[2],
        action: binding[3],
        hold: binding[2].includes('State=Duration'),
      })
    } else {
      lines.push({ kind: 'other', raw })
    }
  }
  return { lines, endsWithNewline }
}

/** Always writes CRLF, which is what the game itself writes. */
export function serializeSettings(file: SettingsFile): string {
  const text = file.lines
    .map((line) => (line.kind === 'binding' ? `${line.key}=${line.body}` : line.raw))
    .join('\r\n')
  return file.endsWithNewline ? `${text}\r\n` : text
}

export type ImportError = 'noSections' | 'noBindings'

export interface ImportCheck {
  error?: ImportError
  /** Value of `[InputSettings] Version=` when it is not the expected one. */
  unexpectedVersion?: string
}

export const EXPECTED_VERSION = '60'

export function checkImport(file: SettingsFile): ImportCheck {
  const others = file.lines.filter((l): l is OtherLine => l.kind === 'other')
  if (!others.some((l) => SECTION_RE.test(l.raw))) return { error: 'noSections' }
  if (!file.lines.some((l) => l.kind === 'binding')) return { error: 'noBindings' }
  const version = others.map((l) => /^Version=(.*)$/.exec(l.raw)?.[1]).find((v) => v !== undefined)
  if (version !== undefined && version !== EXPECTED_VERSION) return { unexpectedVersion: version }
  return {}
}

/** Decodes an uploaded file, handling the UTF-16 BOM some editors add. */
export function decodeFile(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes)
  if (view[0] === 0xff && view[1] === 0xfe) return new TextDecoder('utf-16le').decode(view.subarray(2))
  if (view[0] === 0xfe && view[1] === 0xff) return new TextDecoder('utf-16be').decode(view.subarray(2))
  return new TextDecoder('utf-8').decode(view).replace(/^﻿/, '')
}
