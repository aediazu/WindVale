import { Monster } from './monster.js';

export const DUNGEON_FLOORS = [
  { floor: 1,  tiers: [1, 1],       bossId: null,            goldMult: 0.80 },
  { floor: 2,  tiers: [1, 1],       bossId: null,            goldMult: 0.90 },
  { floor: 3,  tiers: [1, 1],       bossId: null,            goldMult: 1.00 },
  { floor: 4,  tiers: [1, 1, 2],    bossId: null,            goldMult: 1.15 },
  { floor: 5,  tiers: [1, 2, 2],    bossId: null,            goldMult: 1.30 },
  { floor: 6,  tiers: [2, 2, 2],    bossId: 'fire_dragon',   goldMult: 1.50 },
  { floor: 7,  tiers: [2, 2, 3],    bossId: null,            goldMult: 1.70 },
  { floor: 8,  tiers: [2, 3, 3],    bossId: 'sea_serpent',   goldMult: 1.90 },
  { floor: 9,  tiers: [3, 3, 3],    bossId: 'storm_titan',   goldMult: 2.15 },
  { floor: 10, tiers: [3, 3, 3],    bossId: null,            goldMult: 2.40 },
  { floor: 11, tiers: [3, 3, 3],    bossId: null,            goldMult: 2.70 },
  { floor: 12, tiers: [],           bossId: 'dungeon_heart',  goldMult: 3.00 },
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
  constructor(floorNumber, runNumber = 1) {
    this.floorData   = DUNGEON_FLOORS[floorNumber - 1];
    this.floorNumber = floorNumber;
    this.scale       = 1 + (floorNumber - 1) * 0.18 + (runNumber - 1) * 0.08;
    this.rooms       = this._buildRooms();
    this.roomIndex   = 0;
    this.floorGold   = 0;
    this.done        = false;
    this.eventResult = null;
  }

  _buildRooms() {
    const rooms = [];
    this.floorData.tiers.forEach((tier, i) => {
      if (i > 0 && Math.random() < 0.20) {
        rooms.push({ type: 'event', event: randomEvent() });
      }
      rooms.push({ type: 'combat', monster: Monster.random(tier, this.scale) });
    });
    if (this.floorData.bossId) {
      rooms.push({ type: 'boss', monster: Monster.fromId(this.floorData.bossId, this.scale) });
    }
    return rooms;
  }

  get current()      { return this.rooms[this.roomIndex]; }
  get progress()     { return { done: this.roomIndex, total: this.rooms.length }; }
  get isFinalFloor() { return this.floorNumber === 12; }

  advance() {
    this.roomIndex++;
    this.eventResult = null;
    if (this.roomIndex >= this.rooms.length) this.done = true;
  }

  addGold(amount) {
    const actual = Math.floor(amount * this.floorData.goldMult);
    this.floorGold += actual;
    return actual;
  }
}
