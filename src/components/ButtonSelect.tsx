import * as Select from '@radix-ui/react-select'
import { BUTTON_LABELS, PAD_BUTTONS, type Button, type Layout } from '../core/buttons'
import { ButtonIcon } from './ButtonIcon'

// Radix Select does not accept an empty string as a value.
const NONE = 'none'

interface Props {
  value: Button | null
  layout: Layout
  noneLabel: string
  ariaLabel: string
  status?: 'conflict' | 'warning'
  describedBy?: string
  onChange: (button: Button | null) => void
}

export function ButtonSelect({ value, layout, noneLabel, ariaLabel, status, describedBy, onChange }: Props) {
  return (
    <Select.Root value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : (v as Button))}>
      <Select.Trigger
        className="select-trigger"
        data-status={status}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={status === 'conflict' || undefined}
      >
        <Select.Value />
        <Select.Icon className="select-chevron">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={4}>
          <Select.Viewport className="select-viewport">
            <Select.Item value={NONE} className="select-item">
              <Select.ItemText>
                <span className="select-option">
                  <span className="none-icon" aria-hidden="true">∅</span>
                  {noneLabel}
                </span>
              </Select.ItemText>
            </Select.Item>
            {PAD_BUTTONS.map((button) => (
              <Select.Item key={button} value={button} className="select-item">
                <Select.ItemText>
                  <span className="select-option">
                    <ButtonIcon button={button} layout={layout} size={24} />
                    {BUTTON_LABELS[button][layout]}
                  </span>
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
