import { ELEMENTS } from './elements.js';

export const MONSTER_TEMPLATES = [
  // Tier 1
  {
    id: 'fire_slime',
    name: 'Slime de Fuego',
    element: ELEMENTS.FIRE,
    tier: 1,
    baseHp: 40, baseAttack: 8, baseDefense: 2, speed: 8,
    goldReward: [5, 12],
    skills: [{ name: 'Escupir Fuego', element: ELEMENTS.FIRE, power: 1.3 }],
    description: 'Una gelatina ardiente del volcán norte.',
  },
  {
    id: 'water_sprite',
    name: 'Sprite de Agua',
    element: ELEMENTS.WATER,
    tier: 1,
    baseHp: 35, baseAttack: 10, baseDefense: 3, speed: 12,
    goldReward: [5, 12],
    skills: [{ name: 'Chorro', element: ELEMENTS.WATER, power: 1.3 }],
    description: 'Un espíritu travieso de los ríos.',
  },
  {
    id: 'mud_crab',
    name: 'Cangrejo de Barro',
    element: ELEMENTS.EARTH,
    tier: 1,
    baseHp: 50, baseAttack: 7, baseDefense: 5, speed: 6,
    goldReward: [4, 10],
    skills: [{ name: 'Pinzas', element: ELEMENTS.EARTH, power: 1.2 }],
    description: 'Un cangrejo acorazado de los pantanos.',
  },
  {
    id: 'wind_bat',
    name: 'Murciélago del Viento',
    element: ELEMENTS.AIR,
    tier: 1,
    baseHp: 30, baseAttack: 11, baseDefense: 1, speed: 16,
    goldReward: [4, 10],
    skills: [{ name: 'Aletazo', element: ELEMENTS.AIR, power: 1.2 }],
    description: 'Un veloz murciélago de las cavernas ventosas.',
  },
  // Tier 2
  {
    id: 'earth_golem',
    name: 'Gólem de Tierra',
    element: ELEMENTS.EARTH,
    tier: 2,
    baseHp: 80, baseAttack: 14, baseDefense: 10, speed: 5,
    goldReward: [18, 32],
    skills: [
      { name: 'Puñetazo de Roca', element: ELEMENTS.EARTH, power: 1.4 },
      { name: 'Terremoto', element: ELEMENTS.EARTH, power: 1.7 },
    ],
    description: 'Un coloso de piedra animado por magia antigua.',
  },
  {
    id: 'air_hawk',
    name: 'Halcón del Viento',
    element: ELEMENTS.AIR,
    tier: 2,
    baseHp: 55, baseAttack: 17, baseDefense: 3, speed: 20,
    goldReward: [18, 32],
    skills: [
      { name: 'Giro Cortante', element: ELEMENTS.AIR, power: 1.4 },
      { name: 'Pico Afilado', element: ELEMENTS.NEUTRAL, power: 1.1 },
    ],
    description: 'Un ave veloz criada en los picos de la montaña.',
  },
  {
    id: 'flame_knight',
    name: 'Caballero de Llamas',
    element: ELEMENTS.FIRE,
    tier: 2,
    baseHp: 70, baseAttack: 16, baseDefense: 8, speed: 9,
    goldReward: [20, 35],
    skills: [
      { name: 'Estocada Ardiente', element: ELEMENTS.FIRE, power: 1.5 },
      { name: 'Escudo de Fuego', element: ELEMENTS.NEUTRAL, power: 1.0 },
    ],
    description: 'Un guerrero caído poseído por el fuego eterno.',
  },
  // Tier 3 (bosses)
  {
    id: 'fire_dragon',
    name: 'Draco de Fuego',
    element: ELEMENTS.FIRE,
    tier: 3,
    baseHp: 130, baseAttack: 22, baseDefense: 12, speed: 10,
    goldReward: [50, 80],
    skills: [
      { name: 'Aliento de Fuego', element: ELEMENTS.FIRE, power: 1.8 },
      { name: 'Cola', element: ELEMENTS.NEUTRAL, power: 1.2 },
    ],
    description: 'Un dragón menor, aun así aterrador.',
  },
  {
    id: 'sea_serpent',
    name: 'Serpiente Marina',
    element: ELEMENTS.WATER,
    tier: 3,
    baseHp: 120, baseAttack: 20, baseDefense: 9, speed: 14,
    goldReward: [45, 75],
    skills: [
      { name: 'Marea Alta', element: ELEMENTS.WATER, power: 1.8 },
      { name: 'Constricción', element: ELEMENTS.NEUTRAL, power: 1.1 },
    ],
    description: 'Una serpiente colosal de las profundidades.',
  },
  {
    id: 'storm_titan',
    name: 'Titán de la Tormenta',
    element: ELEMENTS.AIR,
    tier: 3,
    baseHp: 110, baseAttack: 25, baseDefense: 6, speed: 18,
    goldReward: [55, 90],
    skills: [
      { name: 'Rayo', element: ELEMENTS.AIR, power: 1.9 },
      { name: 'Vórtice', element: ELEMENTS.AIR, power: 1.4 },
    ],
    description: 'Un titán convocado por las tormentas eternas.',
  },
];

export function getByTier(tier) {
  return MONSTER_TEMPLATES.filter(m => m.tier === tier);
}

export function getById(id) {
  return MONSTER_TEMPLATES.find(m => m.id === id) ?? null;
}
