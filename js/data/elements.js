export const ELEMENTS = {
  FIRE:    'Fuego',
  WATER:   'Agua',
  EARTH:   'Tierra',
  AIR:     'Aire',
  NEUTRAL: 'Neutral',
};

// Water beats Fire, Fire beats Air, Air beats Earth, Earth beats Water
const CHART = {
  Fuego:   { Fuego: 0.5, Agua: 0.75, Tierra: 1.0,  Aire: 1.5,  Neutral: 1.0 },
  Agua:    { Fuego: 1.5, Agua: 0.5,  Tierra: 0.75, Aire: 1.0,  Neutral: 1.0 },
  Tierra:  { Fuego: 1.0, Agua: 1.5,  Tierra: 0.5,  Aire: 0.75, Neutral: 1.0 },
  Aire:    { Fuego: 0.75,Agua: 1.0,  Tierra: 1.5,  Aire: 0.5,  Neutral: 1.0 },
  Neutral: { Fuego: 1.0, Agua: 1.0,  Tierra: 1.0,  Aire: 1.0,  Neutral: 1.0 },
};

export function getMultiplier(attackEl, defenseEl) {
  return CHART[attackEl]?.[defenseEl] ?? 1.0;
}

export function effectivenessText(mult) {
  if (mult >= 1.5) return '¡Muy efectivo!';
  if (mult <= 0.5) return 'Resistido...';
  if (mult < 1.0) return 'Poco efectivo...';
  return '';
}

export const ELEMENT_ICON = {
  Fuego:   '🔥',
  Agua:    '💧',
  Tierra:  '🌍',
  Aire:    '💨',
  Neutral: '⚪',
};

export const ELEMENT_COLOR = {
  Fuego:   '#e85d04',
  Agua:    '#0096c7',
  Tierra:  '#588157',
  Aire:    '#90e0ef',
  Neutral: '#adb5bd',
};
