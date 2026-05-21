import { Monster } from './monster.js';

export const ADVENTURES = [
  {
    id: 'caves',
    name: 'Cavernas de Ignis',
    description: 'Cuevas volcánicas al sur. Monstruos de Fuego predominan.',
    difficulty: 'Fácil',
    rooms: 4,
    tiers: [1, 1, 1, 2],
    bossId: 'fire_dragon',
    goldMult: 1.0,
  },
  {
    id: 'lake',
    name: 'Lago Abismal',
    description: 'Un lago de aguas oscuras. Los pescadores no regresan.',
    difficulty: 'Normal',
    rooms: 4,
    tiers: [1, 2, 2, 2],
    bossId: 'sea_serpent',
    goldMult: 1.3,
  },
  {
    id: 'ruins',
    name: 'Ruinas del Viento',
    description: 'Ruinas antiguas azotadas por vientos eternos. Muy peligroso.',
    difficulty: 'Difícil',
    rooms: 5,
    tiers: [2, 2, 3, 3, 3],
    bossId: 'storm_titan',
    goldMult: 1.7,
  },
];

const EVENTS = [
  { id: 'treasure', name: 'Cofre del tesoro',  description: 'Encuentras un cofre abandonado.',  effect: { goldBonus: 25 } },
  { id: 'fountain', name: 'Fuente mágica',      description: 'Una fuente restaura tus fuerzas.', effect: { healPercent: 0.35 } },
  { id: 'trap',     name: 'Trampa',             description: '¡Caes en una trampa oculta!',      effect: { damage: 15 } },
  { id: 'shrine',   name: 'Santuario elemental',description: 'Un santuario restaura tu maná.',   effect: { mpPercent: 0.5 } },
];

function randomEvent() {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

export class Dungeon {
  constructor(adventureId, runNumber = 1) {
    this.adventure   = ADVENTURES.find(a => a.id === adventureId);
    this.scale       = 1 + (runNumber - 1) * 0.12;
    this.rooms       = this._buildRooms();
    this.roomIndex   = 0;
    this.totalGold   = 0;
    this.done        = false;
    this.eventResult = null;
  }

  _buildRooms() {
    const rooms = [];
    this.adventure.tiers.forEach((tier, i) => {
      // 20% chance of an event room before combat (not first room)
      if (i > 0 && Math.random() < 0.2) {
        rooms.push({ type: 'event', event: randomEvent() });
      }
      rooms.push({ type: 'combat', monster: Monster.random(tier, this.scale) });
    });
    // Boss always last
    if (this.adventure.bossId) {
      rooms.push({ type: 'boss', monster: Monster.fromId(this.adventure.bossId, this.scale) });
    }
    return rooms;
  }

  get current()  { return this.rooms[this.roomIndex]; }
  get progress() { return { done: this.roomIndex, total: this.rooms.length }; }

  advance() {
    this.roomIndex++;
    this.eventResult = null;
    if (this.roomIndex >= this.rooms.length) this.done = true;
  }

  addGold(amount) {
    const actual = Math.floor(amount * this.adventure.goldMult);
    this.totalGold += actual;
    return actual;
  }
}
