import { useRef, useState, type Dispatch } from 'react'
import { AREAS, COMMANDS, type Command } from '../data/commands'
import { checkImport, decodeFile, parseSettings } from '../core/settingsFile'
import { contextLabel, type Strings } from '../i18n/strings'
import type { Action, Derived, State } from '../state'
import { ButtonSelect } from './ButtonSelect'
import { ExportDialog, Modal } from './Dialogs'
import { FileNames } from './FileNames'

interface Props {
  state: State
  dispatch: Dispatch<Action>
  derived: Derived
  t: Strings
}

interface Notice {
  kind: 'error' | 'warning'
  text: string
}

const AREA_COMMANDS = AREAS.map((area) => ({ area, commands: COMMANDS.filter((c) => c.area === area) })).filter(
  (group) => group.commands.length > 0,
)
const ORDERED_IDS = AREA_COMMANDS.flatMap((group) => group.commands.map((c) => c.id))
const NAME_BY_ID = new Map(COMMANDS.map((c) => [c.id, c.names]))

function download(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'input.settings'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function Editor({ state, dispatch, derived, t }: Props) {
  const layout = state.layout
  const fileInput = useRef<HTMLInputElement>(null)
  const [dialog, setDialog] = useState<'export' | 'restore' | 'replace' | null>(null)
  const [pending, setPending] = useState<{ text: string; name: string } | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const conflictIds = ORDERED_IDS.filter((id) => derived.conflicts.has(id))
  const nameOf = (id: string) => NAME_BY_ID.get(id)?.[state.locale] ?? id

  const load = (text: string, name: string) => {
    dispatch({ type: 'load', text, name })
    const { unexpectedVersion } = checkImport(parseSettings(text))
    setNotice(unexpectedVersion ? { kind: 'warning', text: t.importVersionWarning(unexpectedVersion) } : null)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    let text: string
    try {
      text = decodeFile(await file.arrayBuffer())
    } catch {
      setNotice({ kind: 'error', text: t.importErrorRead })
      return
    }
    const { error } = checkImport(parseSettings(text))
    if (error) {
      setNotice({ kind: 'error', text: error === 'noSections' ? t.importErrorNoSections : t.importErrorNoBindings })
      return
    }
    if (state.dirty) {
      setPending({ text, name: file.name })
      setDialog('replace')
    } else {
      load(text, file.name)
    }
  }

  const scrollToFirstConflict = () => {
    const first = conflictIds[0]
    if (!first) return
    const row = document.getElementById(`cmd-${first}`)
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    row?.querySelector('button')?.focus({ preventScroll: true })
  }

  const renderRow = (command: Command) => {
    const button = state.assignment[command.id] ?? null
    const conflicts = derived.conflicts.get(command.id)
    const warnings: string[] = []
    if (command.essential && button === null) warnings.push(t.warnEssentialNone)
    if (state.divergent.includes(command.id)) warnings.push(t.warnDivergent)
    const status = conflicts ? 'conflict' : warnings.length ? 'warning' : undefined
    const messageId = `msg-${command.id}`
    return (
      <tr key={command.id} id={`cmd-${command.id}`} className="command-row" data-status={status}>
        <th scope="row" className="command-name">
          {command.names[state.locale]}
          {command.essential && <span className="badge">{t.essential}</span>}
        </th>
        <td className="command-press">
          <span className={`press press-${command.press}`}>{t[command.press]}</span>
        </td>
        <td className="command-button">
          <ButtonSelect
            value={button}
            layout={layout}
            noneLabel={t.none}
            ariaLabel={`${command.names[state.locale]}: ${t.button}`}
            status={status}
            describedBy={status ? messageId : undefined}
            onChange={(next) => dispatch({ type: 'setButton', commandId: command.id, button: next })}
          />
          {status && (
            <ul id={messageId} className="command-messages">
              {conflicts?.map((c) => (
                <li key={c.otherId} className="message-conflict">
                  {t.conflictWith(nameOf(c.otherId), contextLabel(t, c.context))}
                </li>
              ))}
              {warnings.map((w) => (
                <li key={w} className="message-warning">
                  {w}
                </li>
              ))}
            </ul>
          )}
        </td>
      </tr>
    )
  }

  return (
    <main className="editor">
      <div className="toolbar" role="toolbar">
        <div className="toolbar-group">
          <span className="source">{state.sourceName ? t.importedFrom(state.sourceName) : t.editingDefault}</span>
        </div>
        <div className="toolbar-group">
          <div className="segmented" role="radiogroup" aria-label={t.layout}>
            {(['playstation', 'xbox'] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={layout === l}
                className="segmented-option"
                onClick={() => dispatch({ type: 'pickLayout', layout: l })}
              >
                {t[l]}
              </button>
            ))}
          </div>
          <button type="button" className="btn" onClick={() => fileInput.current?.click()}>
            {t.import}
          </button>
          <input
            ref={fileInput}
            type="file"
            hidden
            onChange={(e) => {
              void onFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <button type="button" className="btn" onClick={() => setDialog('restore')}>
            {t.restoreDefault}
          </button>
          <button
            type="button"
            className={`conflict-count ${conflictIds.length ? 'has-conflicts' : ''}`}
            onClick={scrollToFirstConflict}
            disabled={!conflictIds.length}
            aria-live="polite"
          >
            {conflictIds.length ? t.conflictCount(conflictIds.length) : t.noConflicts}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDialog('export')}
            disabled={conflictIds.length > 0}
            title={conflictIds.length ? t.exportBlocked : undefined}
          >
            {t.export}
          </button>
        </div>
      </div>

      {notice && (
        <div className={`notice notice-${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
          <span>
            <FileNames text={notice.text} />
          </span>
          <button type="button" className="btn btn-small" onClick={() => setNotice(null)}>
            {t.dismiss}
          </button>
        </div>
      )}

      {AREA_COMMANDS.map(({ area, commands }) => (
        <section key={area} className="area" aria-labelledby={`area-${area}`}>
          <h2 id={`area-${area}`} className="area-title">
            {t.areas[area]}
          </h2>
          <table className="commands">
            <thead>
              <tr>
                <th scope="col">{t.command}</th>
                <th scope="col">{t.press}</th>
                <th scope="col">{t.button}</th>
              </tr>
            </thead>
            <tbody>{commands.map(renderRow)}</tbody>
          </table>
        </section>
      ))}

      <ExportDialog
        open={dialog === 'export'}
        t={t}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          download(derived.exportText())
          dispatch({ type: 'exported' })
          setDialog(null)
        }}
      />
      <Modal
        open={dialog === 'restore'}
        title={t.restoreTitle}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onCancel={() => setDialog(null)}
        onConfirm={() => {
          dispatch({ type: 'restoreDefault' })
          setNotice(null)
          setDialog(null)
        }}
      >
        <p>{t.restoreBody}</p>
      </Modal>
      <Modal
        open={dialog === 'replace'}
        title={t.importReplaceTitle}
        confirmLabel={t.confirm}
        cancelLabel={t.cancel}
        onCancel={() => {
          setPending(null)
          setDialog(null)
        }}
        onConfirm={() => {
          if (pending) load(pending.text, pending.name)
          setPending(null)
          setDialog(null)
        }}
      >
        <p>{t.importReplaceBody}</p>
      </Modal>
    </main>
  )
}
