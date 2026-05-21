import { ELEMENTS } from './elements.js';

export const CLASSES = [
  {
    id: 'crusader',
    name: 'Crusader',
    icon: '🛡',
    description: 'A heavily armored holy warrior. Slow but nearly unbreakable. Excels at outlasting any foe.',
    passive: 'fortitude',
    passiveDesc: 'Fortitude: Take 25% less damage from all attacks.',
    stats: { maxHp: 130, maxMp: 30, baseAttack: 14, baseDefense: 7, speed: 7 },
    skills: [
      { id: 'holy_smite',    name: 'Holy Smite',    element: ELEMENTS.NEUTRAL, mpCost: 8,  power: 1.7 },
      { id: 'crusade',       name: 'Crusade',        element: ELEMENTS.FIRE,    mpCost: 14, power: 2.0 },
      { id: 'earth_ward',    name: 'Earth Ward',     element: ELEMENTS.EARTH,   mpCost: 10, power: 1.4 },
      { id: 'divine_wrath',  name: 'Divine Wrath',   element: ELEMENTS.NEUTRAL, mpCost: 12, power: 1.5 },
    ],
  },
  {
    id: 'highwayman',
    name: 'Highwayman',
    icon: '🗡',
    description: 'A cunning outlaw. Hits fast and hard, but paper-thin. Punishes enemies who dare strike back.',
    passive: 'riposte',
    passiveDesc: 'Riposte: 35% chance to counter-attack after taking damage.',
    stats: { maxHp: 80, maxMp: 25, baseAttack: 20, baseDefense: 1, speed: 16 },
    skills: [
      { id: 'pistol_shot',   name: 'Pistol Shot',   element: ELEMENTS.NEUTRAL, mpCost: 12, power: 2.2 },
      { id: 'dagger_throw',  name: 'Dagger Throw',  element: ELEMENTS.AIR,     mpCost: 8,  power: 1.6 },
      { id: 'wicked_slice',  name: 'Wicked Slice',  element: ELEMENTS.NEUTRAL, mpCost: 10, power: 1.8 },
      { id: 'open_vein',     name: 'Open Vein',     element: ELEMENTS.EARTH,   mpCost: 14, power: 2.0 },
    ],
  },
  {
    id: 'plague_doctor',
    name: 'Plague Doctor',
    icon: '🩺',
    description: 'A battlefield medic versed in poison and medicine. Sustains through the longest fights.',
    passive: 'battlefield_medicine',
    passiveDesc: 'Battlefield Medicine: Recover 20% of damage taken after each enemy hit.',
    stats: { maxHp: 90, maxMp: 80, baseAttack: 12, baseDefense: 3, speed: 12 },
    skills: [
      { id: 'blight_vial',    name: 'Blight Vial',    element: ELEMENTS.EARTH,   mpCost: 14, power: 1.6 },
      { id: 'noxious_blast',  name: 'Noxious Blast',  element: ELEMENTS.AIR,     mpCost: 12, power: 1.5 },
      { id: 'incision',       name: 'Incision',        element: ELEMENTS.NEUTRAL, mpCost: 8,  power: 1.3 },
      { id: 'field_dressing', name: 'Field Dressing',  element: ELEMENTS.NEUTRAL, mpCost: 16, power: 0, selfHeal: 40 },
    ],
  },
  {
    id: 'arcanist',
    name: 'Arcanist',
    icon: '🔮',
    description: 'A master of elemental destruction. Devastating first strikes, but extremely fragile.',
    passive: 'arcane_surge',
    passiveDesc: 'Arcane Surge: First skill used each combat deals +60% bonus damage.',
    stats: { maxHp: 70, maxMp: 100, baseAttack: 17, baseDefense: 1, speed: 11 },
    skills: [
      { id: 'fireball',        name: 'Fireball',        element: ELEMENTS.FIRE,  mpCost: 18, power: 2.2 },
      { id: 'frost_lance',     name: 'Frost Lance',     element: ELEMENTS.WATER, mpCost: 16, power: 2.0 },
      { id: 'stone_spike',     name: 'Stone Spike',     element: ELEMENTS.EARTH, mpCost: 14, power: 1.8 },
      { id: 'chain_lightning', name: 'Chain Lightning', element: ELEMENTS.AIR,   mpCost: 20, power: 2.4 },
    ],
  },
];
