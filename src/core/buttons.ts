export const PAD_BUTTONS = [
  'IK_Pad_A_CROSS',
  'IK_Pad_B_CIRCLE',
  'IK_Pad_X_SQUARE',
  'IK_Pad_Y_TRIANGLE',
  'IK_Pad_LeftShoulder',
  'IK_Pad_RightShoulder',
  'IK_Pad_LeftTrigger',
  'IK_Pad_RightTrigger',
  'IK_Pad_LeftThumb',
  'IK_Pad_RightThumb',
  'IK_Pad_DigitUp',
  'IK_Pad_DigitDown',
  'IK_Pad_DigitLeft',
  'IK_Pad_DigitRight',
  'IK_Pad_Start',
  'IK_Pad_Back_Select',
] as const

export type Button = (typeof PAD_BUTTONS)[number]

/** The value the Settings File uses for an unbound slot. */
export const NONE_KEY = 'IK_None'

export type Layout = 'playstation' | 'xbox'

export const BUTTON_LABELS: Record<Button, Record<Layout, string>> = {
  IK_Pad_A_CROSS: { playstation: 'Cross', xbox: 'A' },
  IK_Pad_B_CIRCLE: { playstation: 'Circle', xbox: 'B' },
  IK_Pad_X_SQUARE: { playstation: 'Square', xbox: 'X' },
  IK_Pad_Y_TRIANGLE: { playstation: 'Triangle', xbox: 'Y' },
  IK_Pad_LeftShoulder: { playstation: 'L1', xbox: 'LB' },
  IK_Pad_RightShoulder: { playstation: 'R1', xbox: 'RB' },
  IK_Pad_LeftTrigger: { playstation: 'L2', xbox: 'LT' },
  IK_Pad_RightTrigger: { playstation: 'R2', xbox: 'RT' },
  IK_Pad_LeftThumb: { playstation: 'L3', xbox: 'LS' },
  IK_Pad_RightThumb: { playstation: 'R3', xbox: 'RS' },
  IK_Pad_DigitUp: { playstation: 'D-pad ↑', xbox: 'D-pad ↑' },
  IK_Pad_DigitDown: { playstation: 'D-pad ↓', xbox: 'D-pad ↓' },
  IK_Pad_DigitLeft: { playstation: 'D-pad ←', xbox: 'D-pad ←' },
  IK_Pad_DigitRight: { playstation: 'D-pad →', xbox: 'D-pad →' },
  IK_Pad_Start: { playstation: 'Options', xbox: 'Menu' },
  IK_Pad_Back_Select: { playstation: 'Create', xbox: 'View' },
}

export function isButton(key: string): key is Button {
  return (PAD_BUTTONS as readonly string[]).includes(key)
}
