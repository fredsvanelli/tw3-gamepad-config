import { BUTTON_LABELS, type Button, type Layout } from '../core/buttons'

const FACE: Partial<Record<Button, { ps: string; xbox: string; letter: string }>> = {
  IK_Pad_A_CROSS: { ps: '#7aa7e8', xbox: '#5bb04a', letter: 'A' },
  IK_Pad_B_CIRCLE: { ps: '#e86a6a', xbox: '#d9453b', letter: 'B' },
  IK_Pad_X_SQUARE: { ps: '#d98cc4', xbox: '#3f7fd9', letter: 'X' },
  IK_Pad_Y_TRIANGLE: { ps: '#5fc9a8', xbox: '#e8b731', letter: 'Y' },
}

const DPAD_ARM: Partial<Record<Button, string>> = {
  IK_Pad_DigitUp: 'M10 2h8v9h-8z',
  IK_Pad_DigitDown: 'M10 17h8v9h-8z',
  IK_Pad_DigitLeft: 'M2 10h9v8H2z',
  IK_Pad_DigitRight: 'M17 10h9v8h-9z',
}

function PsSymbol({ button, color }: { button: Button; color: string }) {
  const stroke = { stroke: color, strokeWidth: 2.2, fill: 'none', strokeLinecap: 'round' as const }
  switch (button) {
    case 'IK_Pad_A_CROSS':
      return <path d="M9.5 9.5l9 9M18.5 9.5l-9 9" {...stroke} />
    case 'IK_Pad_B_CIRCLE':
      return <circle cx="14" cy="14" r="5.5" {...stroke} />
    case 'IK_Pad_X_SQUARE':
      return <rect x="9" y="9" width="10" height="10" {...stroke} />
    default:
      return <path d="M14 8.5l6 10.5H8z" {...stroke} strokeLinejoin="round" />
  }
}

export function ButtonIcon({ button, layout, size = 28 }: { button: Button; layout: Layout; size?: number }) {
  const label = BUTTON_LABELS[button][layout]
  const face = FACE[button]
  const arm = DPAD_ARM[button]
  return (
    <svg className="button-icon" width={size} height={size} viewBox="0 0 28 28" role="img" aria-label={label}>
      {face ? (
        <>
          <circle cx="14" cy="14" r="12.5" className="icon-body" />
          {layout === 'playstation' ? (
            <PsSymbol button={button} color={face.ps} />
          ) : (
            <text x="14" y="18.5" textAnchor="middle" fontSize="13" fontWeight="700" fill={face.xbox}>
              {face.letter}
            </text>
          )}
        </>
      ) : arm ? (
        <>
          <path d="M10 2h8v8h8v8h-8v8h-8v-8H2v-8h8z" className="icon-body" />
          <path d={arm} className="icon-accent" />
        </>
      ) : button === 'IK_Pad_Start' ? (
        <>
          <rect x="3" y="7" width="22" height="14" rx="7" className="icon-body" />
          <path d="M9.5 11h9M9.5 14h9M9.5 17h9" className="icon-line" />
        </>
      ) : button === 'IK_Pad_Back_Select' ? (
        <>
          <rect x="3" y="7" width="22" height="14" rx="7" className="icon-body" />
          <rect x="9" y="10" width="6.5" height="5" rx="1" className="icon-outline" />
          <rect x="12.5" y="13" width="6.5" height="5" rx="1" className="icon-outline" />
        </>
      ) : button === 'IK_Pad_LeftThumb' || button === 'IK_Pad_RightThumb' ? (
        <>
          <circle cx="14" cy="14" r="12.5" className="icon-body" />
          <circle cx="14" cy="14" r="8" className="icon-ring" />
          <text x="14" y="17.5" textAnchor="middle" fontSize="9" fontWeight="700" className="icon-text">
            {label}
          </text>
        </>
      ) : (
        <>
          <rect x="1.5" y="6" width="25" height="16" rx={button.includes('Trigger') ? 3 : 8} className="icon-body" />
          <text
            x="14"
            y="17.5"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            className="icon-text"
          >
            {label}
          </text>
        </>
      )}
    </svg>
  )
}
