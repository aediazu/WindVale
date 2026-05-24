import { ELEMENTS } from '../data/elements.js';

export class Character {
  constructor() {
    this._class = null;
    this.name   = 'Hero';
    this.element = ELEMENTS.NEUTRAL;

    this.maxHp       = 100;
    this.hp          = 100;
    this.baseAttack  = 15;
    this.baseDefense = 3;
    this.speed       = 10;

    this.weapon = { name: 'Iron Sword',     attackBonus: 0,  level: 0 };
    this.armor  = { name: 'Leather Armor',  defenseBonus: 0, level: 0 };

    this.items = [
      { id: 'potion', name: 'Potion', quantity: 3, healHp: 30 },
    ];

    this.level   = 1;
    this.xp      = 0;

    this.maxMana = 15;
    this.mana    = 15;
  }

  get attack()        { return this.baseAttack  + (this.weapon?.attackBonus  ?? 0); }
  get defense()       { return this.baseDefense + (this.armor?.defenseBonus  ?? 0); }
  get skills()        { return this._class?.skills ?? []; }
  get xpToNextLevel() { return this.level * 50; }

  addXp(amount) {
    this.xp += amount;
    let gained = 0;
    while (this.xp >= this.xpToNextLevel) {
      this.xp   -= this.xpToNextLevel;
      this.level++;
      this.maxHp      += 10;
      this.hp         += 10;
      this.baseAttack += 1;
      gained++;
    }
    return gained;
  }

  setClass(cls) {
    this._class      = cls;
    this.maxHp       = cls.stats.maxHp;
    this.hp          = cls.stats.maxHp;
    this.baseAttack  = cls.stats.baseAttack;
    this.baseDefense = cls.stats.baseDefense;
    this.speed       = cls.stats.speed;
    this.element     = ELEMENTS.NEUTRAL;
  }

  isAlive()   { return this.hp > 0; }
  hpPercent() { return this.hp / this.maxHp; }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  takeDamage(rawAmount) {
    const dmg = Math.max(1, rawAmount - this.defense);
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }

  fullRestore() {
    this.hp   = this.maxHp;
    this.mana = this.maxMana;
  }

  spendMana(n) {
    this.mana = Math.max(0, this.mana - n);
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
}
