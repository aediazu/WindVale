export const ELEMENTS = {
  FIRE:    'Fire',
  WATER:   'Water',
  EARTH:   'Earth',
  AIR:     'Air',
  NEUTRAL: 'Neutral',
};

// Water beats Fire, Fire beats Air, Air beats Earth, Earth beats Water
const CHART = {
  Fire:    { Fire: 0.5, Water: 0.75, Earth: 1.0,  Air: 1.5,  Neutral: 1.0 },
  Water:   { Fire: 1.5, Water: 0.5,  Earth: 0.75, Air: 1.0,  Neutral: 1.0 },
  Earth:   { Fire: 1.0, Water: 1.5,  Earth: 0.5,  Air: 0.75, Neutral: 1.0 },
  Air:     { Fire: 0.75,Water: 1.0,  Earth: 1.5,  Air: 0.5,  Neutral: 1.0 },
  Neutral: { Fire: 1.0, Water: 1.0,  Earth: 1.0,  Air: 1.0,  Neutral: 1.0 },
};

export function getMultiplier(attackEl, defenseEl) {
  return CHART[attackEl]?.[defenseEl] ?? 1.0;
}

export function effectivenessText(mult) {
  if (mult >= 1.5) return 'Super effective!';
  if (mult <= 0.5) return 'Resisted...';
  if (mult < 1.0) return 'Not very effective...';
  return '';
}

export const ELEMENT_ICON = {
  Fire:    '🔥',
  Water:   '💧',
  Earth:   '🌍',
  Air:     '💨',
  Neutral: '⚪',
};

export const ELEMENT_COLOR = {
  Fire:    '#c44018',
  Water:   '#186080',
  Earth:   '#486030',
  Air:     '#607898',
  Neutral: '#686060',
};
