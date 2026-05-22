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
    skillTree: [
      // Branch A — Holy Fire
      {
        id: 'crusader_holy_smite', name: 'Holy Smite',
        element: ELEMENTS.FIRE, mpCost: 12, power: 1.5,
        requires: [], tier: 1,
        description: 'Strike down the wicked with holy fire.',
      },
      {
        id: 'crusader_consecrate', name: 'Consecrate',
        element: ELEMENTS.FIRE, mpCost: 18, power: 2.0,
        requires: ['crusader_holy_smite'], tier: 2,
        description: 'Sanctify the battlefield with sacred flame.',
      },
      {
        id: 'crusader_judgment', name: 'Judgment',
        element: ELEMENTS.FIRE, mpCost: 26, power: 2.6,
        requires: ['crusader_consecrate'], tier: 3,
        description: "Heaven's sentence rains down upon your enemy.",
      },
      {
        id: 'crusader_wrath_of_god', name: 'Wrath of God',
        element: ELEMENTS.FIRE, mpCost: 50, power: 3.8,
        requires: ['crusader_judgment'], tier: 4,
        description: 'Unmake the unworthy with divine fury. Nothing survives.',
      },
      // Branch B — Earth + Sustain
      {
        id: 'crusader_shield_slam', name: 'Shield Slam',
        element: ELEMENTS.EARTH, mpCost: 8, power: 1.3,
        requires: [], tier: 1,
        description: 'Bash with your tower shield — cheap and reliable.',
      },
      {
        id: 'crusader_iron_bastion', name: 'Iron Bastion',
        element: ELEMENTS.NEUTRAL, mpCost: 20, selfHeal: 65,
        requires: ['crusader_shield_slam'], tier: 2,
        description: "Draw on earth's endurance to mend your wounds.",
      },
      {
        id: 'crusader_wardens_might', name: "Warden's Might",
        element: ELEMENTS.EARTH, mpCost: 22, power: 2.2,
        requires: ['crusader_iron_bastion'], tier: 3,
        description: 'Channel your defense into a crushing blow.',
      },
      {
        id: 'crusader_soul_rend', name: 'Soul Rend',
        element: ELEMENTS.NEUTRAL, mpCost: 30, power: 2.5, drain: 0.5,
        requires: ['crusader_wardens_might'], tier: 4,
        description: 'Tear away their essence, drinking their vitality.',
      },
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
    skillTree: [
      // Branch A — Gun
      {
        id: 'hw_pistol_shot', name: 'Pistol Shot',
        element: ELEMENTS.AIR, mpCost: 10, power: 1.7,
        requires: [], tier: 1,
        description: 'Fast, accurate, no flourish. Just damage.',
      },
      {
        id: 'hw_wicked_slice', name: 'Wicked Slice',
        element: ELEMENTS.AIR, mpCost: 17, power: 2.1,
        requires: ['hw_pistol_shot'], tier: 2,
        description: 'A vicious cut that leaves the enemy reeling.',
      },
      {
        id: 'hw_double_tap', name: 'Double Tap',
        element: ELEMENTS.AIR, mpCost: 25, power: 2.8,
        requires: ['hw_wicked_slice'], tier: 3,
        description: 'Two shots: the first staggers, the second kills.',
      },
      {
        id: 'hw_point_blank', name: 'Point Blank',
        element: ELEMENTS.AIR, mpCost: 38, power: 3.8,
        requires: ['hw_double_tap'], tier: 4,
        description: 'Press the barrel to their chest and pull the trigger.',
      },
      // Branch B — Blades
      {
        id: 'hw_dagger_throw', name: 'Dagger Throw',
        element: ELEMENTS.NEUTRAL, mpCost: 7, power: 1.3,
        requires: [], tier: 1,
        description: 'Hurl a dagger with deadly precision.',
      },
      {
        id: 'hw_open_vein', name: 'Open Vein',
        element: ELEMENTS.NEUTRAL, mpCost: 15, power: 1.9,
        requires: ['hw_dagger_throw'], tier: 2,
        description: 'Open a grievous wound that bleeds freely.',
      },
      {
        id: 'hw_death_mark', name: 'Death Mark',
        element: ELEMENTS.NEUTRAL, mpCost: 22, power: 2.5,
        requires: ['hw_open_vein'], tier: 3,
        description: 'Mark your enemy for death, then deliver on it.',
      },
      {
        id: 'hw_assassination', name: 'Assassination',
        element: ELEMENTS.NEUTRAL, mpCost: 50, power: 4.2,
        requires: ['hw_death_mark'], tier: 4,
        description: 'The perfect execution. One strike. No witnesses.',
      },
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
    skillTree: [
      // Branch A — Poison
      {
        id: 'pd_blight_vial', name: 'Blight Vial',
        element: ELEMENTS.WATER, mpCost: 10, power: 1.4,
        requires: [], tier: 1,
        description: 'A vial of concentrated disease hurled at your foe.',
      },
      {
        id: 'pd_noxious_blast', name: 'Noxious Blast',
        element: ELEMENTS.WATER, mpCost: 18, power: 2.0,
        requires: ['pd_blight_vial'], tier: 2,
        description: 'Aerosolize the blight for maximum effect.',
      },
      {
        id: 'pd_virulent_strike', name: 'Virulent Strike',
        element: ELEMENTS.WATER, mpCost: 26, power: 2.6,
        requires: ['pd_noxious_blast'], tier: 3,
        description: 'A blade coated in pure virulence.',
      },
      {
        id: 'pd_black_death', name: 'Black Death',
        element: ELEMENTS.WATER, mpCost: 42, power: 3.4,
        requires: ['pd_virulent_strike'], tier: 4,
        description: 'The most lethal plague ever synthesized.',
      },
      // Branch B — Dark Medicine
      {
        id: 'pd_field_dressing', name: 'Field Dressing',
        element: ELEMENTS.NEUTRAL, mpCost: 15, selfHeal: 50,
        requires: [], tier: 1,
        description: 'Staunch your wounds hastily in the field.',
      },
      {
        id: 'pd_triage', name: 'Triage',
        element: ELEMENTS.NEUTRAL, mpCost: 28, selfHeal: 100,
        requires: ['pd_field_dressing'], tier: 2,
        description: 'Emergency field surgery — dramatic restoration.',
      },
      {
        id: 'pd_blood_transfusion', name: 'Blood Transfusion',
        element: ELEMENTS.NEUTRAL, mpCost: 40, selfHeal: 165,
        requires: ['pd_triage'], tier: 3,
        description: 'Restore yourself with harvested vitality.',
      },
      {
        id: 'pd_final_remedy', name: 'Final Remedy',
        element: ELEMENTS.NEUTRAL, mpCost: 55, selfHeal: 250,
        requires: ['pd_blood_transfusion'], tier: 4,
        description: "The ultimate healing compound. You should be dead. You aren't.",
      },
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
    skillTree: [
      // Branch A — Fire / Earth
      {
        id: 'arc_fireball', name: 'Fireball',
        element: ELEMENTS.FIRE, mpCost: 12, power: 1.6,
        requires: [], tier: 1,
        description: 'A classic sphere of concentrated flame.',
      },
      {
        id: 'arc_stone_spike', name: 'Stone Spike',
        element: ELEMENTS.EARTH, mpCost: 16, power: 1.9,
        requires: ['arc_fireball'], tier: 2,
        description: 'Wrench a spike of bedrock from the earth.',
      },
      {
        id: 'arc_meteor', name: 'Meteor',
        element: ELEMENTS.FIRE, mpCost: 32, power: 2.9,
        requires: ['arc_stone_spike'], tier: 3,
        description: 'Call down a burning rock from the sky.',
      },
      {
        id: 'arc_arcane_nova', name: 'Arcane Nova',
        element: ELEMENTS.FIRE, mpCost: 55, power: 4.0,
        requires: ['arc_meteor'], tier: 4,
        description: 'A detonation of raw arcane fire that scorches reality.',
      },
      // Branch B — Water / Air
      {
        id: 'arc_frost_lance', name: 'Frost Lance',
        element: ELEMENTS.WATER, mpCost: 10, power: 1.5,
        requires: [], tier: 1,
        description: 'A needle of absolute cold that pierces armor.',
      },
      {
        id: 'arc_chain_lightning', name: 'Chain Lightning',
        element: ELEMENTS.AIR, mpCost: 18, power: 2.0,
        requires: ['arc_frost_lance'], tier: 2,
        description: 'A bolt of lightning crackling with power.',
      },
      {
        id: 'arc_blizzard', name: 'Blizzard',
        element: ELEMENTS.WATER, mpCost: 30, power: 2.7,
        requires: ['arc_chain_lightning'], tier: 3,
        description: 'A localized blizzard of ice and fury.',
      },
      {
        id: 'arc_void_rift', name: 'Void Rift',
        element: ELEMENTS.NEUTRAL, mpCost: 65, power: 4.8,
        requires: ['arc_blizzard'], tier: 4,
        description: 'Tear open a rift to the void. Unmake your enemy.',
      },
    ],
  },
];
