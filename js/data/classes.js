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
    branches: {
      a: {
        name: 'The Ironwall',
        lore: 'Some warriors win by never losing. Behind that shield lies an immovable object — something the dungeon has never truly broken. They absorb everything. They endure everything. Then they strike once, with everything they have left.',
      },
      b: {
        name: 'The Devastator',
        lore: "A greatsword doesn't defend. It ends things. Devastators don't take hits — they prevent them by killing too fast for anything to fight back. If you're still taking damage, you're not swinging hard enough.",
      },
    },
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

  // ── SORCERER ─────────────────────────────────────────────────────────────
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    icon: '🔮',
    description: 'A glass cannon who bends magic to its breaking point. The Eternal Flame path unleashes devastating fire. The Grey Veil masters raw arcane force, draining life to sustain itself in battle.',
    passive: 'arcane_surge',
    passiveDesc: 'Arcane Surge: Your first skill use each combat fires with 60% bonus power. ⚡',
    stats: { maxHp: 70, maxMp: 130, baseAttack: 12, baseDefense: 1, speed: 12 },
    branches: {
      a: {
        name: 'The Eternal Flame',
        lore: "Fire has no patience. No subtlety. No regret. Eternal Flame mages don't calculate — they ignite. The path commits to one principle: if it can burn, burn it. If it can't, burn it harder. Every mage who walked this road was warned it would consume them. Every one of them smiled and said yes.",
      },
      b: {
        name: 'The Grey Veil',
        lore: "The elements are for amateurs. The Grey Veil looks past fire and water, past the comfortable categories — into the raw fabric that underlies all things. These spells don't discriminate. They overwhelm. And when you drain what you need from an enemy to keep standing, you tell yourself it's strategy. Mostly, you're right.",
      },
    },
    skillTree: [
      // Branch A — Eternal Flame (Fire)
      {
        id: 'sc_fireball', name: 'Fireball',
        element: ELEMENTS.FIRE, mpCost: 10, power: 1.4,
        branch: 'a', requires: [], tier: 1,
        description: 'The simplest spell. Also the most satisfying.',
      },
      {
        id: 'sc_blazing_ray', name: 'Blazing Ray',
        element: ELEMENTS.FIRE, mpCost: 18, power: 2.0,
        branch: 'a', requires: ['sc_fireball'], tier: 2,
        description: 'A sustained beam of pure fire. This is your path now.',
      },
      {
        id: 'sc_inferno', name: 'Inferno',
        element: ELEMENTS.FIRE, mpCost: 28, power: 2.8,
        branch: 'a', requires: ['sc_blazing_ray'], tier: 3,
        description: 'The world around your enemy becomes an oven.',
      },
      {
        id: 'sc_phoenix_burst', name: 'Phoenix Burst',
        element: ELEMENTS.FIRE, mpCost: 38, power: 3.5, selfHeal: 35,
        branch: 'a', requires: ['sc_inferno'], tier: 4,
        description: 'Fire heals those who truly belong to it.',
      },
      {
        id: 'sc_supernova', name: 'Supernova',
        element: ELEMENTS.FIRE, mpCost: 60, power: 5.0,
        branch: 'a', requires: ['sc_phoenix_burst'], tier: 5,
        description: 'When this lands, it ends.',
      },
      // Branch B — Grey Veil (Arcane/Drain)
      {
        id: 'sc_arcane_bolt', name: 'Arcane Bolt',
        element: ELEMENTS.NEUTRAL, mpCost: 10, power: 1.5,
        branch: 'b', requires: [], tier: 1,
        description: 'Raw magical force, unfiltered by any element.',
      },
      {
        id: 'sc_mana_drain', name: 'Mana Drain',
        element: ELEMENTS.NEUTRAL, mpCost: 16, power: 1.8, drain: 0.3,
        branch: 'b', requires: ['sc_arcane_bolt'], tier: 2,
        description: 'Tear their energy. Feed your own. The Veil claims you.',
      },
      {
        id: 'sc_arcane_barrage', name: 'Arcane Barrage',
        element: ELEMENTS.NEUTRAL, mpCost: 26, power: 2.5, drain: 0.35,
        branch: 'b', requires: ['sc_mana_drain'], tier: 3,
        description: 'A cascade of arcane missiles that shred through defenses.',
      },
      {
        id: 'sc_void_collapse', name: 'Void Collapse',
        element: ELEMENTS.NEUTRAL, mpCost: 38, power: 3.3, drain: 0.35,
        branch: 'b', requires: ['sc_arcane_barrage'], tier: 4,
        description: 'Space itself folds around your target. Life flows back to you.',
      },
      {
        id: 'sc_last_theorem', name: 'The Last Theorem',
        element: ELEMENTS.NEUTRAL, mpCost: 58, power: 4.8, drain: 0.4,
        branch: 'b', requires: ['sc_void_collapse'], tier: 5,
        description: "A spell so complex that casting it ages you. It's worth it.",
      },
    ],
  },
];
