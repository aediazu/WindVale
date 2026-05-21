import { ELEMENTS } from '../data/elements.js';

export class Character {
  constructor() {
    this.name = 'Héroe';
    this.element = ELEMENTS.NEUTRAL;

    this.maxHp = 100;
    this.hp = 100;
    this.maxMp = 60;
    this.mp = 60;

    this.baseAttack = 15;
    this.baseDefense = 3;
    this.speed = 10;

    this.weapon = { name: 'Espada de Hierro', attackBonus: 0, level: 0 };
    this.armor  = { name: 'Armadura de Cuero', defenseBonus: 0, level: 0 };

    this.items = [
      { id: 'potion', name: 'Poción', quantity: 3, healHp: 30 },
    ];

    this.skills = [
      { id: 'fire_strike',  name: 'Golpe de Fuego',  element: ELEMENTS.FIRE,  mpCost: 12, power: 1.6 },
      { id: 'water_bolt',   name: 'Rayo de Agua',    element: ELEMENTS.WATER, mpCost: 12, power: 1.6 },
      { id: 'earth_crush',  name: 'Aplaste de Tierra',element: ELEMENTS.EARTH, mpCost: 12, power: 1.6 },
      { id: 'air_slash',    name: 'Corte de Aire',   element: ELEMENTS.AIR,   mpCost: 12, power: 1.6 },
    ];
  }

  get attack()  { return this.baseAttack  + (this.weapon?.attackBonus  ?? 0); }
  get defense() { return this.baseDefense + (this.armor?.defenseBonus  ?? 0); }

  isAlive() { return this.hp > 0; }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  restoreMp(amount) {
    this.mp = Math.min(this.maxMp, this.mp + amount);
  }

  takeDamage(rawAmount) {
    const dmg = Math.max(1, rawAmount - this.defense);
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }

  canUseSkill(skill) {
    return this.mp >= skill.mpCost;
  }

  spendMp(amount) {
    this.mp = Math.max(0, this.mp - amount);
  }

  getItem(itemId) {
    return this.items.find(i => i.id === itemId) ?? null;
  }

  consumeItem(itemId) {
    const item = this.getItem(itemId);
    if (!item || item.quantity <= 0) return null;
    item.quantity--;
    if (item.quantity === 0) this.items = this.items.filter(i => i.quantity > 0);
    return item;
  }

  addItem(itemData) {
    const existing = this.getItem(itemData.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...itemData, quantity: 1 });
    }
  }

  fullRestore() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
  }

  hpPercent()  { return this.hp  / this.maxHp; }
  mpPercent()  { return this.mp  / this.maxMp; }
}
