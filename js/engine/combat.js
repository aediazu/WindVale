import { getMultiplier, effectivenessText } from '../data/elements.js';

export class Combat {
  constructor(character, monster) {
    this.character = character;
    this.monster   = monster;
    this.log       = [];
    this.state     = 'active'; // 'active' | 'won' | 'lost' | 'fled'
    this.goldEarned = 0;
    this.subScreen = null; // null | 'skills' | 'items'
  }

  // --- Player actions ---

  attack() {
    if (!this.isPlayerTurn()) return;
    const variance = 0.9 + Math.random() * 0.2;
    const raw = Math.floor(this.character.attack * variance);
    const dmg = this.monster.takeDamage(raw);
    this.addLog(`Atacas a ${this.monster.name} por ${dmg} de daño.`, 'player');
    this.subScreen = null;
    this.afterPlayerAction();
  }

  useSkill(skill) {
    if (!this.isPlayerTurn()) return;
    if (!this.character.canUseSkill(skill)) {
      this.addLog('No tienes suficiente MP.', 'warning');
      return;
    }
    this.character.spendMp(skill.mpCost);
    const mult = getMultiplier(skill.element, this.monster.element);
    const raw  = Math.floor(this.character.attack * skill.power * mult);
    const dmg  = this.monster.takeDamage(raw);
    const note = effectivenessText(mult);
    this.addLog(`${skill.name} → ${dmg} daño${note ? ' — ' + note : ''}.`, 'player-skill');
    this.subScreen = null;
    this.afterPlayerAction();
  }

  useItem(itemId) {
    if (!this.isPlayerTurn()) return;
    const item = this.character.consumeItem(itemId);
    if (!item) { this.addLog('No puedes usar ese ítem.', 'warning'); return; }
    if (item.healHp) {
      this.character.heal(item.healHp);
      this.addLog(`Usas ${item.name} y recuperas ${item.healHp} HP.`, 'heal');
    }
    if (item.healMp) {
      this.character.restoreMp(item.healMp);
      this.addLog(`Usas ${item.name} y recuperas ${item.healMp} MP.`, 'heal');
    }
    this.subScreen = null;
    this.afterPlayerAction();
  }

  flee() {
    if (!this.isPlayerTurn()) return;
    if (Math.random() < 0.55) {
      this.state = 'fled';
      this.addLog('Huiste del combate.', 'info');
    } else {
      this.addLog('¡No pudiste huir!', 'warning');
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
      this.addLog(`¡Derrotaste a ${this.monster.name}! +${this.goldEarned} oro.`, 'victory');
    }
  }

  monsterTurn() {
    if (this.state !== 'active') return;
    const action = this.monster.chooseAction();

    if (action.type === 'skill') {
      const skill = action.skill;
      const mult  = getMultiplier(skill.element, this.character.element);
      const raw   = Math.floor(this.monster.attack * skill.power * mult);
      const dmg   = this.character.takeDamage(raw);
      const note  = effectivenessText(mult);
      this.addLog(`${this.monster.name} usa ${skill.name} → ${dmg} daño${note ? ' — ' + note : ''}.`, 'monster');
    } else {
      const dmg = this.character.takeDamage(this.monster.attack);
      this.addLog(`${this.monster.name} te ataca por ${dmg} de daño.`, 'monster');
    }

    if (!this.character.isAlive()) {
      this.state = 'lost';
      this.addLog('Has caído en combate...', 'defeat');
    }
  }

  isPlayerTurn() { return this.state === 'active'; }

  addLog(message, type = 'info') {
    this.log.push({ message, type });
    if (this.log.length > 12) this.log.shift();
  }
}
