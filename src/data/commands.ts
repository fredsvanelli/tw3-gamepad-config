import type { Button } from '../core/buttons'

export type Locale = 'en' | 'pt' | 'es'
export type Names = Record<Locale, string>

export const AREAS = [
  'general',
  'exploration',
  'combat',
  'horse',
  'boat',
  'swimming',
  'ciri',
  'dialogue',
  'photoMode',
] as const
export type Area = (typeof AREAS)[number]

export type PressType = 'tap' | 'hold'

/**
 * One Action a Command owns. `defaultButton` narrows it to the Bindings that sit
 * on that Button in the default Settings File, for Actions the game binds to
 * two Buttons at once (SwordSheathe is on both D-pad Left and D-pad Right).
 */
export interface ActionRef {
  action: string
  defaultButton?: Button
}

export interface Command {
  id: string
  area: Area
  press: PressType
  actions: (string | ActionRef)[]
  essential?: boolean
  names: Names
}

/** Actions left as they are in the file: debug inputs and analog axes. */
export const UNMANAGED_ACTIONS = [
  'DebugInput',
  'Debug_TeleportToPin',
  'SCN_DBG_RestartScene',
  'SCN_DBG_RestartSection',
  'GI_AxisLeftX',
  'GI_AxisLeftY',
  'GI_AxisRightX',
  'GI_AxisRightY',
  'ChangeChoiceAxis',
  'PMC_MoveForward',
  'PMC_MoveRight',
  'PMC_RotX',
  'PMC_RotY',
]

const onA = (action: string): ActionRef => ({ action, defaultButton: 'IK_Pad_A_CROSS' })
const onL3 = (action: string): ActionRef => ({ action, defaultButton: 'IK_Pad_LeftThumb' })

/** Context-sensitive interactions: the game picks one by what Geralt faces. */
const INTERACTIONS = [
  'Arm', 'BurnBody', 'BuryBody', 'CallJohnny', 'Close', onA('Container'), 'CutRope', 'Debung',
  'Destroy', 'Disarm', 'DisposePaint', 'Drink', 'EnterBoat', 'EnterBoatFromSwimming', 'Examine',
  'Extinguish', onA('FastTravel'), 'Free', 'GatherBrushwood', onA('GatherHerbs'), 'GiveAlms', 'Grab',
  'HangPainting', 'HideBible', 'HideIn', 'Ignite', 'Interact', 'Interaction', 'KneelDown', 'Knock',
  'Lock', 'Locked', 'Look', 'MountHorse', 'Open', 'PetDog', 'PickOilLamp', 'PlaceArmor', 'PlaceBeans',
  'PlaceBottle', 'PlaceCrystal', 'PlaceHerbs', 'PlaceLure', 'PlaceOffering', 'PlaceOilLamp',
  'PlaceSword', 'PlaceTribute', 'PlaceTrophy', 'PrayForStorm', 'PrayForSun', 'Pull', 'PullAxe', 'Push',
  'PutBack', 'Read', 'SitAndWait', 'SitDown', 'SqueezeIn', 'Stash', 'Take', 'TakePaintBlue',
  'TakePaintGreen', 'TakePaintPurple', 'TakePaintRed', 'TakePaintYellow', 'Talk', 'Touch',
  'UnblockGate', 'Unequip', 'Unlock', onA('Use'), 'UseDevice', 'UseItem', 'WineSlot',
]

// Ciri Actions with a Geralt equivalent are listed inside the Geralt Command
// (Mirrored Commands), so they always share its Button.
export const COMMANDS: Command[] = [
  // General
  { id: 'pauseMenu', area: 'general', press: 'tap', essential: true, actions: ['IngameMenu'],
    names: { en: 'Pause menu', pt: 'Menu de pausa', es: 'Menú de pausa' } },
  { id: 'glossary', area: 'general', press: 'hold', actions: ['GotoGlossary'],
    names: { en: 'Glossary', pt: 'Glossário', es: 'Glosario' } },
  { id: 'characterMenu', area: 'general', press: 'tap', essential: true, actions: ['FastMenu'],
    names: { en: 'Character menu', pt: 'Menu do personagem', es: 'Menú del personaje' } },
  { id: 'map', area: 'general', press: 'hold', actions: ['PanelMap'],
    names: { en: 'Map', pt: 'Mapa', es: 'Mapa' } },
  { id: 'showEntry', area: 'general', press: 'tap', actions: ['ShowEntryInPanel'],
    names: { en: 'Open notification entry', pt: 'Abrir entrada da notificação', es: 'Abrir entrada de la notificación' } },
  { id: 'trackQuest', area: 'general', press: 'tap', actions: ['TrackQuest', 'HighlightObjective'],
    names: { en: 'Track quest / highlight objective', pt: 'Rastrear missão / destacar objetivo', es: 'Seguir misión / resaltar objetivo' } },
  { id: 'radialMenu', area: 'general', press: 'tap', actions: ['RadialMenu'],
    names: { en: 'Radial menu', pt: 'Menu radial', es: 'Menú radial' } },
  { id: 'radialConfirm', area: 'general', press: 'tap', essential: true, actions: ['ConfirmRadialMenuSelection'],
    names: { en: 'Radial menu: confirm', pt: 'Menu radial: confirmar', es: 'Menú radial: confirmar' } },
  { id: 'radialClose', area: 'general', press: 'tap', actions: ['CloseRadialMenu'],
    names: { en: 'Radial menu: close', pt: 'Menu radial: fechar', es: 'Menú radial: cerrar' } },
  { id: 'meditate', area: 'general', press: 'tap', actions: ['OpenMeditation'],
    names: { en: 'Radial menu: meditate', pt: 'Menu radial: meditar', es: 'Menú radial: meditar' } },
  { id: 'potionUpper', area: 'general', press: 'tap', actions: ['DrinkPotion1'],
    names: { en: 'Drink upper potion', pt: 'Beber poção de cima', es: 'Beber poción superior' } },
  { id: 'potionUpperSwap', area: 'general', press: 'hold', actions: ['DrinkPotionUpperHold'],
    names: { en: 'Swap upper potion', pt: 'Trocar poção de cima', es: 'Cambiar poción superior' } },
  { id: 'potionLower', area: 'general', press: 'tap', actions: ['DrinkPotion2'],
    names: { en: 'Drink lower potion', pt: 'Beber poção de baixo', es: 'Beber poción inferior' } },
  { id: 'potionLowerSwap', area: 'general', press: 'hold', actions: ['DrinkPotionLowerHold'],
    names: { en: 'Swap lower potion', pt: 'Trocar poção de baixo', es: 'Cambiar poción inferior' } },
  { id: 'oilSteel', area: 'general', press: 'hold', actions: ['OilSteel'],
    names: { en: 'Apply oil to steel sword', pt: 'Aplicar óleo na espada de aço', es: 'Aplicar aceite a la espada de acero' } },
  { id: 'oilSilver', area: 'general', press: 'hold', actions: ['OilSilver'],
    names: { en: 'Apply oil to silver sword', pt: 'Aplicar óleo na espada de prata', es: 'Aplicar aceite a la espada de plata' } },

  // Exploration
  { id: 'interact', area: 'exploration', press: 'tap', essential: true, actions: INTERACTIONS,
    names: { en: 'Interact (talk, loot, open, mount...)', pt: 'Interagir (falar, saquear, abrir, montar...)', es: 'Interactuar (hablar, saquear, abrir, montar...)' } },
  { id: 'interactHold', area: 'exploration', press: 'hold', actions: ['InteractHold'],
    names: { en: 'Interact (hold)', pt: 'Interagir (segurar)', es: 'Interactuar (mantener)' } },
  { id: 'sprint', area: 'exploration', press: 'tap', actions: ['Sprint'],
    names: { en: 'Sprint', pt: 'Correr', es: 'Esprintar' } },
  { id: 'sprintToggle', area: 'exploration', press: 'tap', actions: ['SprintToggle'],
    names: { en: 'Toggle sprint', pt: 'Alternar corrida', es: 'Alternar esprint' } },
  { id: 'jump', area: 'exploration', press: 'tap', essential: true, actions: ['Jump'],
    names: { en: 'Jump / climb', pt: 'Pular / escalar', es: 'Saltar / trepar' } },
  { id: 'roll', area: 'exploration', press: 'tap', actions: ['Roll'],
    names: { en: 'Roll (exploration)', pt: 'Rolar (exploração)', es: 'Rodar (exploración)' } },
  { id: 'explorationInteraction', area: 'exploration', press: 'tap', actions: ['ExplorationInteraction'],
    names: { en: 'Secondary interaction', pt: 'Interação secundária', es: 'Interacción secundaria' } },
  { id: 'witcherSenses', area: 'exploration', press: 'tap', actions: ['Focus'],
    names: { en: 'Witcher Senses', pt: 'Sentidos de Bruxo', es: 'Sentidos de brujo' } },
  { id: 'callHorse', area: 'exploration', press: 'tap', actions: ['SpawnHorse'],
    names: { en: 'Call Roach', pt: 'Chamar Carpeado', es: 'Llamar a Sardinilla' } },

  // Combat
  { id: 'attackLight', area: 'combat', press: 'tap', essential: true, actions: ['AttackLight', 'Finish', 'Finisher'],
    names: { en: 'Fast attack', pt: 'Ataque rápido', es: 'Ataque rápido' } },
  { id: 'attackHeavy', area: 'combat', press: 'tap', essential: true, actions: ['AttackHeavy', 'CiriAttackHeavy'],
    names: { en: 'Strong attack', pt: 'Ataque forte', es: 'Ataque fuerte' } },
  { id: 'specialLight', area: 'combat', press: 'hold', actions: ['SpecialAttackLight'],
    names: { en: 'Whirl', pt: 'Redemoinho', es: 'Torbellino' } },
  { id: 'specialHeavy', area: 'combat', press: 'hold', actions: ['SpecialAttackHeavy', 'CiriSpecialAttackHeavy'],
    names: { en: 'Rend', pt: 'Rasgar', es: 'Desgarro' } },
  { id: 'dodge', area: 'combat', press: 'tap', essential: true, actions: ['Dodge', 'CiriDodge'],
    names: { en: 'Dodge', pt: 'Esquivar', es: 'Esquivar' } },
  { id: 'combatRoll', area: 'combat', press: 'tap', actions: ['CbtRoll', 'CiriDash'],
    names: { en: 'Roll (combat)', pt: 'Rolar (combate)', es: 'Rodar (combate)' } },
  { id: 'guard', area: 'combat', press: 'tap', essential: true, actions: ['LockAndGuard'],
    names: { en: 'Parry / counterattack', pt: 'Aparar / contra-atacar', es: 'Bloquear / contraatacar' } },
  { id: 'alternate', area: 'combat', press: 'tap', actions: ['Alternate'],
    names: { en: 'Alternate modifier', pt: 'Modificador alternativo', es: 'Modificador alternativo' } },
  { id: 'castSign', area: 'combat', press: 'tap', essential: true, actions: ['CastSign', 'CiriSpecialAttack'],
    names: { en: 'Cast sign', pt: 'Lançar sinal', es: 'Lanzar señal' } },
  { id: 'castSignHold', area: 'combat', press: 'hold', actions: ['CastSignHold'],
    names: { en: 'Alternate sign', pt: 'Sinal alternativo', es: 'Señal alternativa' } },
  { id: 'altQuen', area: 'combat', press: 'tap', actions: ['AltQuenCasting'],
    names: { en: 'Alternate Quen cast', pt: 'Quen alternativo', es: 'Quen alternativo' } },
  { id: 'lockOn', area: 'combat', press: 'tap', actions: ['CameraLock'],
    names: { en: 'Lock on target', pt: 'Travar no alvo', es: 'Fijar objetivo' } },
  { id: 'throwItem', area: 'combat', press: 'tap', actions: ['ThrowItem'],
    names: { en: 'Use bomb / crossbow', pt: 'Usar bomba / besta', es: 'Usar bomba / ballesta' } },
  { id: 'throwItemHold', area: 'combat', press: 'hold', actions: ['ThrowItemHold'],
    names: { en: 'Aim bomb / crossbow', pt: 'Mirar bomba / besta', es: 'Apuntar bomba / ballesta' } },
  { id: 'throwCancel', area: 'combat', press: 'tap', actions: ['ThrowCastAbort'],
    names: { en: 'Cancel aiming', pt: 'Cancelar mira', es: 'Cancelar apuntado' } },
  { id: 'spare', area: 'combat', press: 'tap', actions: ['Spare'],
    names: { en: 'Spare opponent', pt: 'Poupar oponente', es: 'Perdonar al oponente' } },
  { id: 'steelSword', area: 'combat', press: 'tap',
    actions: ['SteelSword', 'ComboDigitLeft', { action: 'CiriDrawWeapon', defaultButton: 'IK_Pad_DigitLeft' }],
    names: { en: 'Draw steel sword', pt: 'Sacar espada de aço', es: 'Desenvainar espada de acero' } },
  { id: 'silverSword', area: 'combat', press: 'tap',
    actions: ['SilverSword', 'ComboDigitRight', { action: 'CiriDrawWeapon', defaultButton: 'IK_Pad_DigitRight' }],
    names: { en: 'Draw silver sword', pt: 'Sacar espada de prata', es: 'Desenvainar espada de plata' } },
  { id: 'sheatheSteel', area: 'combat', press: 'hold',
    actions: [{ action: 'SwordSheathe', defaultButton: 'IK_Pad_DigitLeft' }, { action: 'CiriHolsterWeapon', defaultButton: 'IK_Pad_DigitLeft' }],
    names: { en: 'Sheathe sword (steel side)', pt: 'Guardar espada (lado do aço)', es: 'Envainar espada (lado del acero)' } },
  { id: 'sheatheSilver', area: 'combat', press: 'hold',
    actions: [{ action: 'SwordSheathe', defaultButton: 'IK_Pad_DigitRight' }, { action: 'CiriHolsterWeapon', defaultButton: 'IK_Pad_DigitRight' }],
    names: { en: 'Sheathe sword (silver side)', pt: 'Guardar espada (lado da prata)', es: 'Envainar espada (lado de la plata)' } },

  // Horse
  { id: 'canter', area: 'horse', press: 'tap', actions: ['Canter'],
    names: { en: 'Canter', pt: 'Trotar', es: 'Trotar' } },
  { id: 'gallop', area: 'horse', press: 'hold', actions: ['Gallop'],
    names: { en: 'Gallop', pt: 'Galopar', es: 'Galopar' } },
  { id: 'followRoad', area: 'horse', press: 'tap', actions: ['Follow'],
    names: { en: 'Follow road', pt: 'Seguir a estrada', es: 'Seguir el camino' } },
  { id: 'horseJump', area: 'horse', press: 'tap', actions: ['HorseJump'],
    names: { en: 'Jump (horse)', pt: 'Pular (cavalo)', es: 'Saltar (caballo)' } },
  { id: 'dismount', area: 'horse', press: 'hold', essential: true, actions: ['HorseDismount'],
    names: { en: 'Dismount', pt: 'Desmontar', es: 'Desmontar' } },
  { id: 'horseInteract', area: 'horse', press: 'tap',
    actions: [onL3('Container'), onL3('FastTravel'), onL3('GatherHerbs'), onL3('Use')],
    names: { en: 'Interact from horseback', pt: 'Interagir montado', es: 'Interactuar a caballo' } },
  { id: 'horseAttackA', area: 'horse', press: 'tap', actions: [{ action: 'VehicleAttack', defaultButton: 'IK_Pad_X_SQUARE' }],
    names: { en: 'Mounted attack', pt: 'Ataque montado', es: 'Ataque a caballo' } },
  { id: 'horseAttackB', area: 'horse', press: 'tap', actions: [{ action: 'VehicleAttack', defaultButton: 'IK_Pad_Y_TRIANGLE' }],
    names: { en: 'Mounted attack (second button)', pt: 'Ataque montado (segundo botão)', es: 'Ataque a caballo (segundo botón)' } },
  { id: 'horseSign', area: 'horse', press: 'tap', actions: ['VehicleCastSign'],
    names: { en: 'Cast sign (horse)', pt: 'Lançar sinal (cavalo)', es: 'Lanzar señal (caballo)' } },
  { id: 'vehicleItem', area: 'horse', press: 'tap', actions: ['VehicleItemAction'],
    names: { en: 'Use bomb / crossbow (horse, boat)', pt: 'Usar bomba / besta (cavalo, barco)', es: 'Usar bomba / ballesta (caballo, barco)' } },
  { id: 'vehicleItemHold', area: 'horse', press: 'hold', actions: ['VehicleItemActionHold'],
    names: { en: 'Aim bomb / crossbow (horse, boat)', pt: 'Mirar bomba / besta (cavalo, barco)', es: 'Apuntar bomba / ballesta (caballo, barco)' } },
  { id: 'vehicleItemCancel', area: 'horse', press: 'tap', actions: ['VehicleItemActionAbort'],
    names: { en: 'Cancel aiming (horse, boat)', pt: 'Cancelar mira (cavalo, barco)', es: 'Cancelar apuntado (caballo, barco)' } },

  // Boat
  { id: 'boatAccelerate', area: 'boat', press: 'tap', actions: ['GI_Accelerate'],
    names: { en: 'Accelerate', pt: 'Acelerar', es: 'Acelerar' } },
  { id: 'boatDecelerate', area: 'boat', press: 'tap', actions: ['GI_Decelerate'],
    names: { en: 'Slow down', pt: 'Desacelerar', es: 'Desacelerar' } },
  { id: 'boatDismount', area: 'boat', press: 'tap', essential: true, actions: ['BoatDismount'],
    names: { en: 'Leave boat', pt: 'Sair do barco', es: 'Bajar del barco' } },

  // Swimming and diving
  { id: 'diveUp', area: 'swimming', press: 'tap', essential: true, actions: ['DiveUp'],
    names: { en: 'Swim up', pt: 'Subir', es: 'Subir' } },
  { id: 'diveDown', area: 'swimming', press: 'tap', essential: true, actions: ['DiveDown'],
    names: { en: 'Dive', pt: 'Mergulhar', es: 'Bucear' } },

  // Dialogue and scenes. The game's names are inverted: ChangeChoiceUp sits on D-pad Down.
  { id: 'choicePrevious', area: 'dialogue', press: 'tap', actions: ['ChangeChoiceDown'],
    names: { en: 'Previous dialogue option', pt: 'Opção de diálogo anterior', es: 'Opción de diálogo anterior' } },
  { id: 'choiceNext', area: 'dialogue', press: 'tap', actions: ['ChangeChoiceUp'],
    names: { en: 'Next dialogue option', pt: 'Próxima opção de diálogo', es: 'Siguiente opción de diálogo' } },

  // Photo mode
  { id: 'photoModeFirst', area: 'photoMode', press: 'tap', actions: ['EnablePhotoMode_Step1'],
    names: { en: 'Open photo mode (first button)', pt: 'Abrir modo foto (primeiro botão)', es: 'Abrir modo foto (primer botón)' } },
  { id: 'photoModeSecond', area: 'photoMode', press: 'tap', actions: ['EnablePhotoMode_Step2'],
    names: { en: 'Open photo mode (second button)', pt: 'Abrir modo foto (segundo botão)', es: 'Abrir modo foto (segundo botón)' } },
  { id: 'photoModeExit', area: 'photoMode', press: 'tap', essential: true, actions: ['DisablePhotoMode'],
    names: { en: 'Leave photo mode', pt: 'Sair do modo foto', es: 'Salir del modo foto' } },
  { id: 'photoModeFast', area: 'photoMode', press: 'tap', actions: ['PMC_MoveFast'],
    names: { en: 'Move camera faster', pt: 'Mover câmera mais rápido', es: 'Mover cámara más rápido' } },
  { id: 'photoModeUp', area: 'photoMode', press: 'tap', actions: ['PMC_MoveUp'],
    names: { en: 'Move camera up', pt: 'Subir câmera', es: 'Subir cámara' } },
  { id: 'photoModeDown', area: 'photoMode', press: 'tap', actions: ['PMC_MoveDown'],
    names: { en: 'Move camera down', pt: 'Descer câmera', es: 'Bajar cámara' } },
]
