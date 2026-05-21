import { ELEMENTS } from './elements.js';

export const MONSTER_TEMPLATES = [
  // Tier 1
  {
    id: 'fire_slime',
    name: 'Fire Slime',
    element: ELEMENTS.FIRE,
    tier: 1,
    baseHp: 40, baseAttack: 8, baseDefense: 2, speed: 8,
    goldReward: [5, 12],
    skills: [{ name: 'Spit Fire', element: ELEMENTS.FIRE, power: 1.3 }],
    description: 'A burning glob of jelly from the northern volcano.',
  },
  {
    id: 'water_sprite',
    name: 'Water Sprite',
    element: ELEMENTS.WATER,
    tier: 1,
    baseHp: 35, baseAttack: 10, baseDefense: 3, speed: 12,
    goldReward: [5, 12],
    skills: [{ name: 'Water Jet', element: ELEMENTS.WATER, power: 1.3 }],
    description: 'A mischievous spirit of the rivers.',
  },
  {
    id: 'mud_crab',
    name: 'Mud Crab',
    element: ELEMENTS.EARTH,
    tier: 1,
    baseHp: 50, baseAttack: 7, baseDefense: 5, speed: 6,
    goldReward: [4, 10],
    skills: [{ name: 'Pinch', element: ELEMENTS.EARTH, power: 1.2 }],
    description: 'An armored crab from the marshes.',
  },
  {
    id: 'wind_bat',
    name: 'Wind Bat',
    element: ELEMENTS.AIR,
    tier: 1,
    baseHp: 30, baseAttack: 11, baseDefense: 1, speed: 16,
    goldReward: [4, 10],
    skills: [{ name: 'Wing Slash', element: ELEMENTS.AIR, power: 1.2 }],
    description: 'A swift bat from the windy caverns.',
  },
  // Tier 2
  {
    id: 'earth_golem',
    name: 'Earth Golem',
    element: ELEMENTS.EARTH,
    tier: 2,
    baseHp: 80, baseAttack: 14, baseDefense: 10, speed: 5,
    goldReward: [18, 32],
    skills: [
      { name: 'Rock Punch', element: ELEMENTS.EARTH, power: 1.4 },
      { name: 'Earthquake', element: ELEMENTS.EARTH, power: 1.7 },
    ],
    description: 'A stone colossus animated by ancient magic.',
  },
  {
    id: 'air_hawk',
    name: 'Wind Hawk',
    element: ELEMENTS.AIR,
    tier: 2,
    baseHp: 55, baseAttack: 17, baseDefense: 3, speed: 20,
    goldReward: [18, 32],
    skills: [
      { name: 'Spinning Cut', element: ELEMENTS.AIR, power: 1.4 },
      { name: 'Sharp Beak', element: ELEMENTS.NEUTRAL, power: 1.1 },
    ],
    description: 'A swift bird raised on the mountain peaks.',
  },
  {
    id: 'flame_knight',
    name: 'Flame Knight',
    element: ELEMENTS.FIRE,
    tier: 2,
    baseHp: 70, baseAttack: 16, baseDefense: 8, speed: 9,
    goldReward: [20, 35],
    skills: [
      { name: 'Blazing Thrust', element: ELEMENTS.FIRE, power: 1.5 },
      { name: 'Fire Shield', element: ELEMENTS.NEUTRAL, power: 1.0 },
    ],
    description: 'A fallen warrior possessed by eternal fire.',
  },
  // Tier 3 (bosses)
  {
    id: 'fire_dragon',
    name: 'Fire Drake',
    element: ELEMENTS.FIRE,
    tier: 3,
    baseHp: 130, baseAttack: 22, baseDefense: 12, speed: 10,
    goldReward: [50, 80],
    skills: [
      { name: 'Fire Breath', element: ELEMENTS.FIRE, power: 1.8 },
      { name: 'Tail Swipe', element: ELEMENTS.NEUTRAL, power: 1.2 },
    ],
    description: 'A lesser drake, yet terrifying nonetheless.',
  },
  {
    id: 'sea_serpent',
    name: 'Sea Serpent',
    element: ELEMENTS.WATER,
    tier: 3,
    baseHp: 120, baseAttack: 20, baseDefense: 9, speed: 14,
    goldReward: [45, 75],
    skills: [
      { name: 'Tidal Wave', element: ELEMENTS.WATER, power: 1.8 },
      { name: 'Constrict', element: ELEMENTS.NEUTRAL, power: 1.1 },
    ],
    description: 'A colossal serpent from the deep.',
  },
  {
    id: 'storm_titan',
    name: 'Storm Titan',
    element: ELEMENTS.AIR,
    tier: 3,
    baseHp: 110, baseAttack: 25, baseDefense: 6, speed: 18,
    goldReward: [55, 90],
    skills: [
      { name: 'Lightning', element: ELEMENTS.AIR, power: 1.9 },
      { name: 'Vortex', element: ELEMENTS.AIR, power: 1.4 },
    ],
    description: 'A titan summoned by the eternal storms.',
  },
];

export function getByTier(tier) {
  return MONSTER_TEMPLATES.filter(m => m.tier === tier);
}

export function getById(id) {
  return MONSTER_TEMPLATES.find(m => m.id === id) ?? null;
}
