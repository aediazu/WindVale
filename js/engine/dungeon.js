import { Monster } from './monster.js';

export const ADVENTURES = [
  {
    id: 'caves',
    name: 'Ignis Caverns',
    description: 'Volcanic caves to the south. Fire monsters dominate.',
    difficulty: 'Easy',
    rooms: 4,
    tiers: [1, 1, 1, 2],
    bossId: 'fire_dragon',
    goldMult: 1.0,
  },
  {
    id: 'lake',
    name: 'Abyssal Lake',
    description: 'A lake of dark waters. Fishermen do not return.',
    difficulty: 'Normal',
    rooms: 4,
    tiers: [1, 2, 2, 2],
    bossId: 'sea_serpent',
    goldMult: 1.3,
  },
  {
    id: 'ruins',
    name: 'Wind Ruins',
    description: 'Ancient ruins lashed by eternal winds. Very dangerous.',
    difficulty: 'Hard',
    rooms: 5,
    tiers: [2, 2, 3, 3, 3],
    bossId: 'storm_titan',
    goldMult: 1.7,
  },
];

const EVENTS = [
  { id: 'treasure', name: 'Treasure Chest',   description: 'You find an abandoned chest.',         effect: { goldBonus: 25 } },
  { id: 'fountain', name: 'Magic Fountain',    description: 'A fountain restores your strength.',   effect: { healPercent: 0.35 } },
  { id: 'trap',     name: 'Trap',              description: 'You fall into a hidden trap!',          effect: { damage: 15 } },
  { id: 'shrine',   name: 'Elemental Shrine',  description: 'A shrine restores your mana.',         effect: { mpPercent: 0.5 } },
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
