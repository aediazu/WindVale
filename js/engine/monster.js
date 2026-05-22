import { getById, getByTier } from '../data/monsters.js';

export class Monster {
  constructor(template, scale = 1) {
    this.id          = template.id;
    this.name        = template.name;
    this.element     = template.element;
    this.description = template.description;
    this.speed       = template.speed;
    this.skills      = template.skills;
    this.goldReward  = template.goldReward;
    this.xpReward    = template.xpReward ?? 0;

    this.maxHp    = Math.round(template.baseHp     * scale);
    this.hp       = this.maxHp;
    this.attack   = Math.round(template.baseAttack  * scale);
    this.defense  = Math.round(template.baseDefense * scale);
  }

  isAlive() { return this.hp > 0; }

  takeDamage(rawAmount) {
    const dmg = Math.max(1, rawAmount - this.defense);
    this.hp = Math.max(0, this.hp - dmg);
    return dmg;
  }

  chooseAction() {
    if (this.skills.length > 1 && Math.random() < 0.35) {
      return { type: 'skill', skill: this.skills[Math.floor(Math.random() * this.skills.length)] };
    }
    if (this.skills.length === 1 && Math.random() < 0.5) {
      return { type: 'skill', skill: this.skills[0] };
    }
    return { type: 'attack' };
  }

  goldDrop() {
    const [min, max] = this.goldReward;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  hpPercent() { return this.hp / this.maxHp; }

  static random(tier, scale = 1) {
    const pool = getByTier(tier);
    const template = pool[Math.floor(Math.random() * pool.length)];
    return new Monster(template, scale);
  }

  static fromId(id, scale = 1) {
    const template = getById(id);
    if (!template) return null;
    return new Monster(template, scale);
  }
}
