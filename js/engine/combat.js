import { getMultiplier, effectivenessText } from '../data/elements.js';

export class Combat {
  constructor(character, monster) {
    this.character  = character;
    this.monster    = monster;
    this.log        = [];
    this.state      = 'active'; // 'active' | 'won' | 'lost' | 'fled'
    this.goldEarned = 0;
    this.subScreen  = null; // null | 'skills' | 'items'
    this.surgeReady = character.classPassive === 'arcane_surge';
  }

  // --- Player actions ---

  attack() {
    if (!this.isPlayerTurn()) return;
    const variance = 0.9 + Math.random() * 0.2;
    const raw = Math.floor(this.character.attack * variance);
    const dmg = this.monster.takeDamage(raw);
    this.addLog(`You attack ${this.monster.name} for ${dmg} damage.`, 'player');
    this.subScreen = null;
    this.afterPlayerAction();
  }

  useSkill(skill) {
    if (!this.isPlayerTurn()) return;
    if (!this.character.canUseSkill(skill)) {
      this.addLog('Not enough MP.', 'warning');
      return;
    }
    this.character.spendMp(skill.mpCost);

    // Plague Doctor: Field Dressing heals instead of dealing damage
    if (skill.selfHeal) {
      this.character.heal(skill.selfHeal);
      this.addLog(`${skill.name} → You recover ${skill.selfHeal} HP.`, 'heal');
      this.subScreen = null;
      this.afterPlayerAction();
      return;
    }

    let power = skill.power;
    let surgeNote = '';

    // Arcanist: first skill each combat gets +60% power
    if (this.character.classPassive === 'arcane_surge' && this.surgeReady) {
      power *= 1.6;
      this.surgeReady = false;
      surgeNote = ' ⚡ Surge!';
    }

    const mult = getMultiplier(skill.element, this.monster.element);
    const raw  = Math.floor(this.character.attack * power * mult);
    const dmg  = this.monster.takeDamage(raw);
    const note = effectivenessText(mult);
    this.addLog(`${skill.name} → ${dmg} damage${note ? ' — ' + note : ''}${surgeNote}.`, 'player-skill');
    this.subScreen = null;
    this.afterPlayerAction();
  }

  useItem(itemId) {
    if (!this.isPlayerTurn()) return;
    const item = this.character.consumeItem(itemId);
    if (!item) { this.addLog('Cannot use that item.', 'warning'); return; }
    if (item.healHp) {
      this.character.heal(item.healHp);
      this.addLog(`You use ${item.name} and restore ${item.healHp} HP.`, 'heal');
    }
    if (item.healMp) {
      this.character.restoreMp(item.healMp);
      this.addLog(`You use ${item.name} and restore ${item.healMp} MP.`, 'heal');
    }
    this.subScreen = null;
    this.afterPlayerAction();
  }

  flee() {
    if (!this.isPlayerTurn()) return;
    if (Math.random() < 0.55) {
      this.state = 'fled';
      this.addLog('You fled from combat.', 'info');
    } else {
      this.addLog("Couldn't escape!", 'warning');
      this.subScreen = null;
      this.monsterTurn();
    }
  }

  // --- Internal ---

  afterPlayerAction() {
    if (this.monster.isAlive()) {
      this.monsterTurn();
    } else {
      this.goldEarned = this.monster.goldDrop();
      this.state = 'won';
      this.addLog(`You defeated ${this.monster.name}! +${this.goldEarned} gold.`, 'victory');
    }
  }

  monsterTurn() {
    if (this.state !== 'active') return;
    const action = this.monster.chooseAction();

    // Build raw damage and a deferred log message
    let raw;
    let buildLog;

    if (action.type === 'skill') {
      const { skill } = action;
      const mult = getMultiplier(skill.element, this.character.element);
      raw = Math.floor(this.monster.attack * skill.power * mult);
      const note = effectivenessText(mult);
      buildLog = dmg => `${this.monster.name} uses ${skill.name} → ${dmg} damage${note ? ' — ' + note : ''}.`;
    } else {
      raw = this.monster.attack;
      buildLog = dmg => `${this.monster.name} attacks you for ${dmg} damage.`;
    }

    // Crusader: Fortitude reduces all incoming damage by 25%
    if (this.character.classPassive === 'fortitude') raw = Math.floor(raw * 0.75);

    const dmg = this.character.takeDamage(raw);
    this.addLog(buildLog(dmg), 'monster');

    // Plague Doctor: Battlefield Medicine recovers 20% of damage taken
    if (this.character.classPassive === 'battlefield_medicine' && dmg > 0 && this.character.isAlive()) {
      const healed = Math.max(1, Math.floor(dmg * 0.20));
      this.character.heal(healed);
      this.addLog(`Battlefield Medicine: +${healed} HP recovered.`, 'heal');
    }

    if (!this.character.isAlive()) {
      this.state = 'lost';
      this.addLog('You have fallen in battle...', 'defeat');
      return;
    }

    // Highwayman: Riposte — 35% chance to counter-attack
    if (this.character.classPassive === 'riposte' && Math.random() < 0.35) {
      const counterDmg = this.monster.takeDamage(Math.floor(this.character.attack * 0.8));
      this.addLog(`Riposte! You counter for ${counterDmg} damage.`, 'player');
      if (!this.monster.isAlive()) {
        this.goldEarned = this.monster.goldDrop();
        this.state = 'won';
        this.addLog(`You defeated ${this.monster.name}! +${this.goldEarned} gold.`, 'victory');
      }
    }
  }

  isPlayerTurn() { return this.state === 'active'; }

  addLog(message, type = 'info') {
    this.log.push({ message, type });
    if (this.log.length > 12) this.log.shift();
  }
}
