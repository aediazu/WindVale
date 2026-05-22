import { ELEMENTS } from '../data/elements.js';

export class Character {
  constructor() {
    this._class = null;
    this.name = 'Hero';
    this.element = ELEMENTS.NEUTRAL;

    this.maxHp = 100;
    this.hp = 100;
    this.maxMp = 60;
    this.mp = 60;

    this.baseAttack = 15;
    this.baseDefense = 3;
    this.speed = 10;

    this.weapon = { name: 'Iron Sword', attackBonus: 0, level: 0 };
    this.armor  = { name: 'Leather Armor', defenseBonus: 0, level: 0 };

    this.items = [
      { id: 'potion', name: 'Potion', quantity: 3, healHp: 30 },
    ];

    this.level           = 1;
    this.xp              = 0;
    this._unlockedSkills = new Set();
    this._lockedBranch   = null; // 'a' | 'b' | null
  }

  get attack()       { return this.baseAttack  + (this.weapon?.attackBonus  ?? 0); }
  get defense()      { return this.baseDefense + (this.armor?.defenseBonus  ?? 0); }
  get classPassive() { return this._class?.passive ?? null; }

  get skills() {
    if (!this._class) return [];
    return this._class.skillTree.filter(sk => this._unlockedSkills.has(sk.id));
  }

  get xpToNextLevel() { return this.level * 50; }

  get availableSkillPoints() {
    return (this.level - 1) - this._unlockedSkills.size;
  }

  addXp(amount) {
    this.xp += amount;
    let gained = 0;
    while (this.xp >= this.xpToNextLevel) {
      this.xp -= this.xpToNextLevel;
      this.level++;
      gained++;
    }
    return gained;
  }

  canUnlockSkill(skillId) {
    if (!this._class || this._unlockedSkills.has(skillId)) return false;
    if (this.availableSkillPoints < 1) return false;
    const sk = this._class.skillTree.find(s => s.id === skillId);
    if (!sk) return false;
    // Branch lock: tier-2+ skills of the locked branch are unavailable
    if (sk.tier >= 2 && this._lockedBranch && sk.branch === this._lockedBranch) return false;
    return sk.requires.every(r => this._unlockedSkills.has(r));
  }

  unlockSkill(skillId) {
    if (!this.canUnlockSkill(skillId)) return false;
    this._unlockedSkills.add(skillId);
    const sk = this._class.skillTree.find(s => s.id === skillId);
    // Commit to this branch at tier 2 — lock the other branch's tier-2+
    if (sk.tier >= 2 && !this._lockedBranch) {
      this._lockedBranch = sk.branch === 'a' ? 'b' : 'a';
    }
    // Dragon Path transformation: character becomes Fire element
    if (sk.transform === 'fire') {
      this.element = ELEMENTS.FIRE;
    }
    return true;
  }

  setClass(cls) {
    this._class        = cls;
    this.maxHp         = cls.stats.maxHp;
    this.hp            = cls.stats.maxHp;
    this.maxMp         = cls.stats.maxMp;
    this.mp            = cls.stats.maxMp;
    this.baseAttack    = cls.stats.baseAttack;
    this.baseDefense   = cls.stats.baseDefense;
    this.speed         = cls.stats.speed;
    this._unlockedSkills = new Set();
    this._lockedBranch   = null;
    this.element         = ELEMENTS.NEUTRAL;
  }

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
