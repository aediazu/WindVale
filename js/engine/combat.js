import { ELEMENTS, getMultiplier, effectivenessText } from '../data/elements.js';

export class Combat {
  constructor(character, monster) {
    this.character      = character;
    this.monster        = monster;
    this.log            = [];
    this.state          = 'active'; // 'active' | 'won' | 'lost' | 'fled'
    this.goldEarned     = 0;
    this.xpEarned       = 0;
    this.subScreen      = null; // null | 'skills' | 'items'
    this.surgeReady        = character.classPassive === 'arcane_surge';
    this.furyStacks        = 0;
    this.furyBonus         = 0;
    this.persistentBuff    = null; // { label, bonusDamage }
    this._switchedThisTurn = false;
  }

  // --- Turn-start passives ---

  applyTurnStartPassives() {
    if (this.character.classPassive === 'divine_favor') {
      this.character.heal(10);
      this.addLog('Divine Favor: +10 HP.', 'heal');
    }
  }

  // --- Player actions ---

  attack() {
    if (!this.isPlayerTurn()) return;
    this.applyTurnStartPassives();
    const effectiveAtk = this.character.attack + this.furyBonus;
    const variance = 0.9 + Math.random() * 0.2;
    let raw = Math.floor(effectiveAtk * variance);
    if (this.character.classPassive === 'dragonhunter' && this.monster.element === ELEMENTS.FIRE) {
      raw = Math.floor(raw * 1.25);
    }
    const dmg = this.monster.takeDamage(raw);
    this.addLog(`You attack ${this.monster.name} for ${dmg} damage.`, 'player');
    this._applyPersistentBuff();
    this.subScreen = null;
    this.afterPlayerAction();
  }

  useSkill(skill) {
    if (!this.isPlayerTurn()) return;
    if (!this.character.canUseSkill(skill)) {
      this.addLog('Not enough MP.', 'warning');
      return;
    }
    this.applyTurnStartPassives();
    this.character.spendMp(skill.mpCost);

    // Buff skills (summon / totem): no direct damage, set persistent buff
    if (skill.buff) {
      this.persistentBuff = { label: skill.buff.label, bonusDamage: skill.buff.bonusDamage };
      this.addLog(`${skill.buff.label} summoned! +${skill.buff.bonusDamage} bonus dmg/action.`, 'player-skill');
      this.subScreen = null;
      this.afterPlayerAction();
      return;
    }

    // Pure heal (no power field)
    if (skill.selfHeal && !skill.power) {
      this.character.heal(skill.selfHeal);
      this.addLog(`${skill.name} → You recover ${skill.selfHeal} HP.`, 'heal');
      this._applyPersistentBuff();
      this.subScreen = null;
      this.afterPlayerAction();
      return;
    }

    // Damage (with optional combined heal)
    let power = skill.power;
    let surgeNote = '';
    if (this.character.classPassive === 'arcane_surge' && this.surgeReady) {
      power *= 1.6;
      this.surgeReady = false;
      surgeNote = ' ⚡ Surge!';
    }
    if (this.character.classPassive === 'earthbond' && skill.element === ELEMENTS.EARTH) {
      power *= 1.2;
    }

    let mult = getMultiplier(skill.element, this.monster.element);
    if (this.character.classPassive === 'dragonhunter' && this.monster.element === ELEMENTS.FIRE) {
      mult *= 1.25;
    }
    const effectiveAtk = this.character.attack + this.furyBonus;
    const raw  = Math.floor(effectiveAtk * power * mult);
    const dmg  = this.monster.takeDamage(raw);
    const note = effectivenessText(mult);
    this.addLog(`${skill.name} → ${dmg} damage${note ? ' — ' + note : ''}${surgeNote}.`, 'player-skill');

    if (skill.drain && dmg > 0) {
      const absorbed = Math.max(1, Math.floor(dmg * skill.drain));
      this.character.heal(absorbed);
      this.addLog(`Life drain: +${absorbed} HP absorbed.`, 'heal');
    }

    // Combined damage+heal (e.g. warrior_indomitable)
    if (skill.selfHeal && skill.power) {
      this.character.heal(skill.selfHeal);
      this.addLog(`${skill.name} → healed ${skill.selfHeal} HP.`, 'heal');
    }

    this._applyPersistentBuff();
    this.subScreen = null;
    this.afterPlayerAction();
  }

  useItem(itemId) {
    if (!this.isPlayerTurn()) return;
    this.applyTurnStartPassives();
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
    this._applyPersistentBuff();
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

  _applyPersistentBuff() {
    if (!this.persistentBuff || !this.monster.isAlive()) return;
    const buffDmg = this.persistentBuff.bonusDamage;
    this.monster.hp = Math.max(0, this.monster.hp - buffDmg);
    this.addLog(`${this.persistentBuff.label}: +${buffDmg}!`, 'passive');
  }

  afterPlayerAction() {
    if (this.monster.isAlive()) {
      this.monsterTurn();
    } else {
      this.goldEarned = this.monster.goldDrop();
      this.xpEarned   = this.monster.xpReward;
      this.state = 'won';
      this.addLog(`You defeated ${this.monster.name}! +${this.goldEarned}⚜`, 'victory');
      if (this.character.classPassive === 'death_siphon') {
        this.character.restoreMp(15);
        this.addLog('Death Siphon: +15 MP restored.', 'passive');
      }
    }
  }

  monsterTurn() {
    if (this.state !== 'active') return;
    const action = this.monster.chooseAction();

    let raw;
    let buildLog;

    if (action.type === 'skill') {
      const { skill } = action;
      const mult = getMultiplier(skill.element, this.character.element);
      raw = Math.floor(this.monster.attack * skill.power * mult);
      const note = effectivenessText(mult);
      buildLog = dmg => `${this.monster.name} uses ${skill.name} → ${dmg} damage${note ? ' — ' + note : ''}.`;
    } else {
      const mult = getMultiplier(this.monster.element, this.character.element);
      raw = mult !== 1.0
        ? Math.floor(this.monster.attack * mult)
        : this.monster.attack;
      buildLog = dmg => `${this.monster.name} attacks you for ${dmg} damage.`;
    }

    // Fortitude passive (Warrior shield path spirit — kept for potential future use; currently Warrior uses battle_fury)
    if (this.character.classPassive === 'fortitude') raw = Math.floor(raw * 0.75);

    const dmg = this.character.takeDamage(raw);
    this.addLog(buildLog(dmg), 'monster');

    // Battlefield Medicine
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

    // Battle Fury: gain +2 ATK per hit (max 5 stacks)
    if (this.character.classPassive === 'battle_fury' && this.furyStacks < 5) {
      this.furyStacks++;
      this.furyBonus = this.furyStacks * 2;
      this.addLog(`Battle Fury! +2 ATK (${this.furyStacks} stack${this.furyStacks > 1 ? 's' : ''} — total +${this.furyBonus} ATK).`, 'passive');
    }

    // Riposte
    if (this.character.classPassive === 'riposte' && Math.random() < 0.35) {
      const counterDmg = this.monster.takeDamage(Math.floor(this.character.attack * 0.8));
      this.addLog(`Riposte! You counter for ${counterDmg} damage.`, 'player');
      if (!this.monster.isAlive()) {
        this.goldEarned = this.monster.goldDrop();
        this.xpEarned   = this.monster.xpReward;
        this.state = 'won';
        this.addLog(`You defeated ${this.monster.name}! +${this.goldEarned}⚜`, 'victory');
      }
    }

    this._switchedThisTurn = false;
  }

  switchClass(cls, savedState) {
    if (this._switchedThisTurn) {
      this.addLog('Already switched class this turn.', 'warning');
      return false;
    }
    const currentHp = this.character.hp;
    const currentMp = this.character.mp;
    this.character.setClass(cls);
    this.character.hp = currentHp;
    this.character.mp = Math.min(currentMp, this.character.maxMp);

    if (savedState) {
      (savedState.skills ?? []).forEach(id => this.character._unlockedSkills.add(id));
      this.character._lockedBranch = savedState.lockedBranch ?? null;
      if (this.character._lockedBranch) {
        const commitSkill = cls.skillTree.find(
          sk => sk.tier === 2 && sk.branch !== this.character._lockedBranch
        );
        if (commitSkill?.transform === 'fire') this.character.element = 'Fire';
      }
    }

    this.furyStacks        = 0;
    this.furyBonus         = 0;
    this.surgeReady        = cls.passive === 'arcane_surge';
    this._switchedThisTurn = true;
    this.subScreen         = null;

    this.addLog(`Switched to ${cls.icon} ${cls.name}!`, 'passive');
    return true;
  }

  isPlayerTurn() { return this.state === 'active'; }

  addLog(message, type = 'info') {
    this.log.push({ message, type });
    if (this.log.length > 14) this.log.shift();
  }
}
