import { ELEMENTS } from './elements.js';

export const CLASSES = [
  // ── WARRIOR ──────────────────────────────────────────────────────────────
  {
    id: 'warrior',
    name: 'Warrior',
    icon: '⚔',
    description: 'A battle-hardened fighter who grows stronger with every blow received. Chooses between the defensive mastery of Sword & Shield or the raw devastation of Two-Handed combat.',
    passive: 'battle_fury',
    passiveDesc: 'Battle Fury: Each hit received increases ATK by 2 for the rest of combat (max 5 stacks).',
    stats: { maxHp: 140, maxMp: 40, baseAttack: 18, baseDefense: 6, speed: 7 },
    skillTree: [
      // Branch A — Sword & Shield
      {
        id: 'warrior_shield_bash', name: 'Shield Bash',
        element: ELEMENTS.EARTH, mpCost: 8, power: 1.3,
        branch: 'a', requires: [], tier: 1,
        description: 'A heavy bash that leaves the enemy dazed.',
      },
      {
        id: 'warrior_defensive_strike', name: 'Defensive Strike',
        element: ELEMENTS.EARTH, mpCost: 14, power: 1.6,
        branch: 'a', requires: ['warrior_shield_bash'], tier: 2,
        description: 'Parry and counter in one fluid motion. Committing to the shield path.',
      },
      {
        id: 'warrior_bulwark_slash', name: 'Bulwark Slash',
        element: ELEMENTS.EARTH, mpCost: 22, power: 2.2,
        branch: 'a', requires: ['warrior_defensive_strike'], tier: 3,
        description: 'Your tower shield becomes a weapon.',
      },
      {
        id: 'warrior_indomitable', name: 'Indomitable',
        element: ELEMENTS.NEUTRAL, mpCost: 30, power: 2.8, selfHeal: 50,
        branch: 'a', requires: ['warrior_bulwark_slash'], tier: 4,
        description: 'Endure the unendurable, then obliterate.',
      },
      {
        id: 'warrior_fortress_breaker', name: 'Fortress Breaker',
        element: ELEMENTS.EARTH, mpCost: 45, power: 3.8,
        branch: 'a', requires: ['warrior_indomitable'], tier: 5,
        description: 'Every wall falls.',
      },
      // Branch B — Two-Handed
      {
        id: 'warrior_heavy_strike', name: 'Heavy Strike',
        element: ELEMENTS.NEUTRAL, mpCost: 8, power: 1.5,
        branch: 'b', requires: [], tier: 1,
        description: 'A simple, devastating blow.',
      },
      {
        id: 'warrior_cleave', name: 'Cleave',
        element: ELEMENTS.NEUTRAL, mpCost: 16, power: 2.0,
        branch: 'b', requires: ['warrior_heavy_strike'], tier: 2,
        description: 'A wide arc that tears through all resistance. Committing to the greatsword path.',
      },
      {
        id: 'warrior_reckless_charge', name: 'Reckless Charge',
        element: ELEMENTS.FIRE, mpCost: 24, power: 2.6,
        branch: 'b', requires: ['warrior_cleave'], tier: 3,
        description: 'Rush in headlong. Defense be damned.',
      },
      {
        id: 'warrior_berserkers_wrath', name: "Berserker's Wrath",
        element: ELEMENTS.FIRE, mpCost: 35, power: 3.2,
        branch: 'b', requires: ['warrior_reckless_charge'], tier: 4,
        description: 'Blood and fury.',
      },
      {
        id: 'warrior_titans_fall', name: "Titan's Fall",
        element: ELEMENTS.NEUTRAL, mpCost: 55, power: 4.5,
        branch: 'b', requires: ['warrior_berserkers_wrath'], tier: 5,
        description: 'The final blow. Nobody survives.',
      },
    ],
  },

  // ── DRAGONSLAYER ─────────────────────────────────────────────────────────
  {
    id: 'dragonslayer',
    name: 'Dragonslayer',
    icon: '🐉',
    description: 'A hunter of the most dangerous prey. Choose the precision of the Dragonhunter path, or embrace the Dragon Path and become the very thing you hunt — growing more draconic with every skill.',
    passive: 'dragonhunter',
    passiveDesc: 'Dragonhunter: Deal +25% damage against Fire element enemies.',
    stats: { maxHp: 100, maxMp: 60, baseAttack: 22, baseDefense: 4, speed: 13 },
    skillTree: [
      // Branch A — Dragonhunter
      {
        id: 'ds_dragon_strike', name: 'Dragon Strike',
        element: ELEMENTS.AIR, mpCost: 10, power: 1.6,
        branch: 'a', requires: [], tier: 1,
        description: 'A precise blow aimed at the weak points of a dragon\'s hide.',
      },
      {
        id: 'ds_scale_piercer', name: 'Scale Piercer',
        element: ELEMENTS.AIR, mpCost: 18, power: 2.1,
        branch: 'a', requires: ['ds_dragon_strike'], tier: 2,
        description: 'Penetrates even the thickest dragon scale. This is your path — the hunter\'s path.',
      },
      {
        id: 'ds_venom_lunge', name: 'Venom Lunge',
        element: ELEMENTS.NEUTRAL, mpCost: 26, power: 2.7,
        branch: 'a', requires: ['ds_scale_piercer'], tier: 3,
        description: 'Poison extracted from dragon venom sacs, turned against its source.',
      },
      {
        id: 'ds_slayers_mark', name: "Slayer's Mark",
        element: ELEMENTS.AIR, mpCost: 36, power: 3.2,
        branch: 'a', requires: ['ds_venom_lunge'], tier: 4,
        description: 'Mark the beast. Deliver the killing blow.',
      },
      {
        id: 'ds_dragon_bane', name: 'Dragon Bane',
        element: ELEMENTS.AIR, mpCost: 55, power: 4.5,
        branch: 'a', requires: ['ds_slayers_mark'], tier: 5,
        description: 'The ultimate technique of the dragon hunters. Passed down through generations of loss.',
      },
      // Branch B — Dragon Path
      {
        id: 'ds_dragons_breath', name: "Dragon's Breath",
        element: ELEMENTS.FIRE, mpCost: 12, power: 1.4,
        branch: 'b', requires: [], tier: 1,
        description: 'You inhale deeply... and exhale flame. Something has changed in you.',
      },
      {
        id: 'ds_draconic_scales', name: 'Draconic Scales',
        element: ELEMENTS.FIRE, mpCost: 18, power: 1.8, selfHeal: 30,
        branch: 'b', requires: ['ds_dragons_breath'], tier: 2,
        transform: 'fire',
        description: 'Scales emerge from your skin. You feel the heat inside you. You are Fire now.',
      },
      {
        id: 'ds_wyrms_fury', name: "Wyrm's Fury",
        element: ELEMENTS.FIRE, mpCost: 28, power: 2.5,
        branch: 'b', requires: ['ds_draconic_scales'], tier: 3,
        description: 'The dragon inside you screams for blood.',
      },
      {
        id: 'ds_dragons_roar', name: "Dragon's Roar",
        element: ELEMENTS.FIRE, mpCost: 40, power: 3.4,
        branch: 'b', requires: ['ds_wyrms_fury'], tier: 4,
        description: 'A thunderous roar that shakes the dungeon walls.',
      },
      {
        id: 'ds_true_dragon_form', name: 'True Dragon Form',
        element: ELEMENTS.FIRE, mpCost: 70, power: 5.0,
        branch: 'b', requires: ['ds_dragons_roar'], tier: 5,
        description: 'You are no longer hunting dragons. You ARE the dragon.',
      },
    ],
  },

  // ── NECROMANCER ───────────────────────────────────────────────────────────
  {
    id: 'necromancer',
    name: 'Necromancer',
    icon: '💀',
    description: 'A master of death and undeath. Harness the Dark Arts to obliterate enemies with necrotic power, or walk the Summoner path and raise an army of undead that grows more powerful with each tier.',
    passive: 'death_siphon',
    passiveDesc: 'Death Siphon: Restore 15 MP when an enemy is defeated.',
    stats: { maxHp: 75, maxMp: 120, baseAttack: 14, baseDefense: 1, speed: 11 },
    skillTree: [
      // Branch A — Dark Arts
      {
        id: 'nc_shadow_bolt', name: 'Shadow Bolt',
        element: ELEMENTS.NEUTRAL, mpCost: 10, power: 1.5,
        branch: 'a', requires: [], tier: 1,
        description: 'A bolt of pure dark energy hurled from the shadows.',
      },
      {
        id: 'nc_curse', name: 'Curse',
        element: ELEMENTS.WATER, mpCost: 17, power: 2.0,
        branch: 'a', requires: ['nc_shadow_bolt'], tier: 2,
        description: 'A wasting curse that eats away at vitality. The dark arts claim another student.',
      },
      {
        id: 'nc_soul_shatter', name: 'Soul Shatter',
        element: ELEMENTS.NEUTRAL, mpCost: 26, power: 2.6,
        branch: 'a', requires: ['nc_curse'], tier: 3,
        description: 'Tear the soul from the body. Painfully.',
      },
      {
        id: 'nc_death_coil', name: 'Death Coil',
        element: ELEMENTS.WATER, mpCost: 38, power: 3.2,
        branch: 'a', requires: ['nc_soul_shatter'], tier: 4,
        description: 'A coil of necrotic energy that devours life itself.',
      },
      {
        id: 'nc_obliterate', name: 'Obliterate',
        element: ELEMENTS.NEUTRAL, mpCost: 60, power: 4.6,
        branch: 'a', requires: ['nc_death_coil'], tier: 5,
        description: 'Nothing survives the void. Nothing.',
      },
      // Branch B — Summoner
      {
        id: 'nc_call_skeleton', name: 'Call Skeleton',
        element: ELEMENTS.NEUTRAL, mpCost: 15,
        buff: { label: 'Skeleton', bonusDamage: 12 },
        branch: 'b', requires: [], tier: 1,
        description: 'A rattling skeleton rises from the earth at your call.',
      },
      {
        id: 'nc_bone_commander', name: 'Bone Commander',
        element: ELEMENTS.NEUTRAL, mpCost: 25,
        buff: { label: 'Bone Commander', bonusDamage: 25 },
        branch: 'b', requires: ['nc_call_skeleton'], tier: 2,
        description: 'An armored undead general leads your army. This is the Summoner\'s path.',
      },
      {
        id: 'nc_undead_warrior', name: 'Undead Warrior',
        element: ELEMENTS.NEUTRAL, mpCost: 35,
        buff: { label: 'Undead Warrior', bonusDamage: 40 },
        branch: 'b', requires: ['nc_bone_commander'], tier: 3,
        description: 'A powerful warrior returned from death to serve you.',
      },
      {
        id: 'nc_death_knight', name: 'Death Knight',
        element: ELEMENTS.NEUTRAL, mpCost: 50,
        buff: { label: 'Death Knight', bonusDamage: 60 },
        branch: 'b', requires: ['nc_undead_warrior'], tier: 4,
        description: 'A champion of death rides at your side.',
      },
      {
        id: 'nc_lich_form', name: 'Lich Form',
        element: ELEMENTS.NEUTRAL, mpCost: 70,
        buff: { label: 'Lich Servant', bonusDamage: 90 },
        branch: 'b', requires: ['nc_death_knight'], tier: 5,
        description: 'You ascend to a higher form of undeath. The servant reflects your transformation.',
      },
    ],
  },

  // ── CLERIC ────────────────────────────────────────────────────────────────
  {
    id: 'cleric',
    name: 'Cleric',
    icon: '⚕',
    description: 'A divine warrior torn between the light and the shadow. The Light Cleric channels holy power for healing and judgment. The Shadow Cleric embraces forbidden arts, draining life to sustain themselves.',
    passive: 'divine_favor',
    passiveDesc: 'Divine Favor: Restore 10 HP at the start of each of your turns.',
    stats: { maxHp: 100, maxMp: 90, baseAttack: 13, baseDefense: 4, speed: 10 },
    skillTree: [
      // Branch A — Light Cleric
      {
        id: 'cl_holy_light', name: 'Holy Light',
        element: ELEMENTS.NEUTRAL, mpCost: 14, selfHeal: 45,
        branch: 'a', requires: [], tier: 1,
        description: 'A warm light that mends your wounds.',
      },
      {
        id: 'cl_sacred_flame', name: 'Sacred Flame',
        element: ELEMENTS.FIRE, mpCost: 20, power: 1.8,
        branch: 'a', requires: ['cl_holy_light'], tier: 2,
        description: 'Purifying fire that burns the unworthy. You walk in the light.',
      },
      {
        id: 'cl_radiance', name: 'Radiance',
        element: ELEMENTS.FIRE, mpCost: 28, power: 2.4,
        branch: 'a', requires: ['cl_sacred_flame'], tier: 3,
        description: 'Blinding holy light scorches the enemy.',
      },
      {
        id: 'cl_divine_shield', name: 'Divine Shield',
        element: ELEMENTS.NEUTRAL, mpCost: 35, selfHeal: 120,
        branch: 'a', requires: ['cl_radiance'], tier: 4,
        description: 'A shield of pure divine energy restores your body completely.',
      },
      {
        id: 'cl_smite', name: 'Smite',
        element: ELEMENTS.FIRE, mpCost: 55, power: 4.0,
        branch: 'a', requires: ['cl_divine_shield'], tier: 5,
        description: 'Judgment descends.',
      },
      // Branch B — Shadow Cleric
      {
        id: 'cl_dark_prayer', name: 'Dark Prayer',
        element: ELEMENTS.WATER, mpCost: 12, power: 1.4, drain: 0.4,
        branch: 'b', requires: [], tier: 1,
        description: 'Pray to something darker. It answers. You drain their vitality.',
      },
      {
        id: 'cl_shadow_drain', name: 'Shadow Drain',
        element: ELEMENTS.WATER, mpCost: 18, power: 1.9, drain: 0.5,
        branch: 'b', requires: ['cl_dark_prayer'], tier: 2,
        description: 'Drain the life from your enemy. The shadow embraces you.',
      },
      {
        id: 'cl_unholy_ritual', name: 'Unholy Ritual',
        element: ELEMENTS.NEUTRAL, mpCost: 28, power: 2.4, drain: 0.5,
        branch: 'b', requires: ['cl_shadow_drain'], tier: 3,
        description: 'A rite that would horrify your former order.',
      },
      {
        id: 'cl_soul_feast', name: 'Soul Feast',
        element: ELEMENTS.WATER, mpCost: 40, power: 3.0, drain: 0.6,
        branch: 'b', requires: ['cl_unholy_ritual'], tier: 4,
        description: 'Consume their soul and grow stronger.',
      },
      {
        id: 'cl_black_mass', name: 'Black Mass',
        element: ELEMENTS.NEUTRAL, mpCost: 55, power: 4.2, drain: 0.5,
        branch: 'b', requires: ['cl_soul_feast'], tier: 5,
        description: 'The final heresy. Devastating beyond all reckoning.',
      },
    ],
  },

  // ── SHAMAN ────────────────────────────────────────────────────────────────
  {
    id: 'shaman',
    name: 'Shaman',
    icon: '🌿',
    description: 'A wielder of primal nature magic. The Totem path summons spirit totems that continuously attack your enemies. The Nature Spells path masters elemental forces for direct destruction.',
    passive: 'earthbond',
    passiveDesc: 'Earthbond: Earth element skills deal +20% bonus damage.',
    stats: { maxHp: 95, maxMp: 100, baseAttack: 15, baseDefense: 3, speed: 12 },
    skillTree: [
      // Branch A — Totem Path
      {
        id: 'sh_earth_totem', name: 'Earth Totem',
        element: ELEMENTS.EARTH, mpCost: 12,
        buff: { label: 'Earth Totem', bonusDamage: 10 },
        branch: 'a', requires: [], tier: 1,
        description: 'A stone idol that pulses with earth energy, striking each turn.',
      },
      {
        id: 'sh_storm_totem', name: 'Storm Totem',
        element: ELEMENTS.AIR, mpCost: 22,
        buff: { label: 'Storm Totem', bonusDamage: 22 },
        branch: 'a', requires: ['sh_earth_totem'], tier: 2,
        description: 'Lightning crackles from the raised idol. The totems speak to you.',
      },
      {
        id: 'sh_fire_totem', name: 'Fire Totem',
        element: ELEMENTS.FIRE, mpCost: 32,
        buff: { label: 'Fire Totem', bonusDamage: 35 },
        branch: 'a', requires: ['sh_storm_totem'], tier: 3,
        description: 'A scorching idol of fire that sears the enemy with each action.',
      },
      {
        id: 'sh_spirit_totem', name: 'Spirit Totem',
        element: ELEMENTS.NEUTRAL, mpCost: 45,
        buff: { label: 'Spirit Totem', bonusDamage: 50 },
        branch: 'a', requires: ['sh_fire_totem'], tier: 4,
        description: 'A spirit totem that channels ancestral power into devastating strikes.',
      },
      {
        id: 'sh_ancient_totem', name: 'Ancient Totem',
        element: ELEMENTS.EARTH, mpCost: 65,
        buff: { label: 'Ancient Totem', bonusDamage: 75 },
        branch: 'a', requires: ['sh_spirit_totem'], tier: 5,
        description: 'The oldest spirit. Primal and devastating.',
      },
      // Branch B — Nature Spells
      {
        id: 'sh_stone_throw', name: 'Stone Throw',
        element: ELEMENTS.EARTH, mpCost: 9, power: 1.4,
        branch: 'b', requires: [], tier: 1,
        description: 'A hurled stone, guided by earth magic.',
      },
      {
        id: 'sh_gale_force', name: 'Gale Force',
        element: ELEMENTS.AIR, mpCost: 16, power: 1.9,
        branch: 'b', requires: ['sh_stone_throw'], tier: 2,
        description: 'A blast of wind that tears through armor. The elements answer your call.',
      },
      {
        id: 'sh_tidal_force', name: 'Tidal Force',
        element: ELEMENTS.WATER, mpCost: 25, power: 2.5,
        branch: 'b', requires: ['sh_gale_force'], tier: 3,
        description: 'The crushing power of the ocean brought to bear.',
      },
      {
        id: 'sh_earthquake', name: 'Earthquake',
        element: ELEMENTS.EARTH, mpCost: 36, power: 3.2,
        branch: 'b', requires: ['sh_tidal_force'], tier: 4,
        description: 'The earth itself turns against your enemy.',
      },
      {
        id: 'sh_primal_storm', name: 'Primal Storm',
        element: ELEMENTS.AIR, mpCost: 55, power: 4.3,
        branch: 'b', requires: ['sh_earthquake'], tier: 5,
        description: 'All elements combined in a tempest of pure destruction.',
      },
    ],
  },
];
