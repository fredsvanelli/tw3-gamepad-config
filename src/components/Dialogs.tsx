import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import type { Strings } from '../i18n/strings'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

export function Modal({ open, title, children, confirmLabel, cancelLabel, onConfirm, onCancel }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          <Dialog.Description asChild>
            <div className="dialog-body">{children}</div>
          </Dialog.Description>
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function ExportDialog({
  open,
  t,
  onConfirm,
  onCancel,
}: {
  open: boolean
  t: Strings
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      open={open}
      title={t.exportTitle}
      confirmLabel={t.confirmDownload}
      cancelLabel={t.cancel}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>{t.exportIntro}</p>
      <ol className="export-steps">
        <li>{t.exportStepClose}</li>
        <li>
          {t.exportStepOpen}
          <code className="export-path">{t.exportPath}</code>
        </li>
        <li>{t.exportStepBackup}</li>
        <li>{t.exportStepReplace}</li>
      </ol>
    </Modal>
  )
}
