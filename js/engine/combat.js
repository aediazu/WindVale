import { ELEMENTS, getMultiplier, effectivenessText } from '../data/elements.js';

export class Combat {
  constructor(character, monster) {
    this.character    = character;
    this.monster      = monster;
    this.log          = [];
    this.state        = 'active'; // 'active' | 'won' | 'lost' | 'fled'
    this.goldEarned   = 0;
    this.xpEarned     = 0;
    this.subScreen    = null; // null | 'items' | 'switch'

    this.impetus      = 0;
    this.maxImpetus   = 5;
    this.statuses     = { player: {}, monster: {} };
    this.stanceActive = false;
    this.veilActive   = false;
    this.voluntasUsed = false;
    this.deathShield  = false;
  }

  // ── Resource helpers ─────────────────────────────────────────────────────

  gainImpetus(n) {
    const prev = this.impetus;
    this.impetus = Math.min(this.maxImpetus, this.impetus + n);
    return this.impetus - prev;
  }

  spendImpetus(n) {
    this.impetus = Math.max(0, this.impetus - n);
  }

  canUseSkill(skill) {
    if (skill.passive) return false;
    return this.impetus >= skill.impetusRequires;
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  applyMonsterStatus(name, data) {
    this.statuses.monster[name] = { ...data };
  }

  applyPlayerStatus(name, data) {
    this.statuses.player[name] = { ...data };
  }

  hasMonsterStatus(name) { return !!this.statuses.monster[name]; }

  activeMonsterStatusCount() {
    return Object.keys(this.statuses.monster).length;
  }

  playerDamageMult() {
    return this.statuses.player.fury ? 1.4 : 1.0;
  }

  monsterDamageMult() {
    return this.statuses.monster.vulnerable ? 1.3 : 1.0;
  }

  // ── Tick status effects ───────────────────────────────────────────────────

  tickPlayerStatuses() {
    const fury = this.statuses.player.fury;
    if (fury) {
      fury.turnsLeft--;
      if (fury.turnsLeft <= 0) {
        delete this.statuses.player.fury;
        this.addLog('Fury fades.', 'info');
      }
    }
  }

  tickMonsterStatuses() {
    const ignited = this.statuses.monster.ignited;
    if (ignited) {
      const burnDmg = ignited.burnDamage;
      this.monster.hp = Math.max(0, this.monster.hp - burnDmg);
      this.addLog(`${this.monster.name} burns for ${burnDmg} fire damage.`, 'player-skill');
      ignited.turnsLeft--;
      if (ignited.turnsLeft <= 0) delete this.statuses.monster.ignited;
    }

    const vuln = this.statuses.monster.vulnerable;
    if (vuln) {
      vuln.turnsLeft--;
      if (vuln.turnsLeft <= 0) {
        delete this.statuses.monster.vulnerable;
        this.addLog('Vulnerable fades.', 'info');
      }
    }

  }

  // ── Damage helper ─────────────────────────────────────────────────────────

  _dealDamageToMonster(rawPower, element, physical) {
    const fury     = this.playerDamageMult();
    const vuln     = this.monsterDamageMult();
    const elemMult = getMultiplier(element, this.monster.element);
    const raw  = Math.floor(this.character.attack * rawPower * fury * vuln * elemMult);
    const dmg  = this.monster.takeDamage(raw);
    if (physical && this.hasMonsterStatus('frozen')) {
      delete this.statuses.monster.frozen;
      this.addLog('Physical strike shatters the ice — Frozen broken!', 'info');
    }
    return { dmg, elemMult };
  }

  // ── Player skill actions ──────────────────────────────────────────────────

  executeSkill(skill) {
    if (!this.isPlayerTurn()) return;
    if (!this.canUseSkill(skill)) {
      this.addLog('Cannot use that skill right now.', 'warning');
      return;
    }
    this.tickPlayerStatuses();
    if (skill.impetusRequires > 0) this.spendImpetus(skill.impetusRequires);

    switch (skill.id) {
      case 'warrior_sunder': this._doSunder();    break;
      case 'warrior_brace':  this._doBrace();     break;
      case 'warrior_slam':   this._doSlam();      break;
      case 'sc_ignition':    this._doIgnition();  break;
      case 'sc_frost':       this._doFrostNova(); break;
      case 'sc_discharge':   this._doDischarge(); break;
      case 'sc_veil':        this._doArcaneVeil(); break;
      default:
        this.addLog(`Unknown skill: ${skill.name}`, 'warning');
    }

    this.subScreen = null;
    if (this.state === 'active') this._afterPlayerAct();
  }

  _doSunder() {
    const { dmg, elemMult } = this._dealDamageToMonster(0.5, ELEMENTS.NEUTRAL, true);
    const note = effectivenessText(elemMult);
    this.applyMonsterStatus('vulnerable', { turnsLeft: 2 });
    this.addLog(`Sunder → ${dmg} damage${note ? ' — ' + note : ''}. Vulnerable!`, 'player-skill');
  }

  _doBrace() {
    this.stanceActive = true;
    const gained = this.gainImpetus(2);
    this.addLog(`Brace — bracing for impact. +${gained}⚡ (${this.impetus}/${this.maxImpetus}). Next hit: 50% dmg.`, 'player-skill');
  }

  _doSlam() {
    this.applyMonsterStatus('stunned', { turnsLeft: 1 });
    this.addLog(`Slam! ${this.monster.name} is STUNNED — cannot act next turn.`, 'player-skill');
  }

  _doIgnition() {
    const { dmg, elemMult } = this._dealDamageToMonster(0.8, ELEMENTS.FIRE, false);
    const note = effectivenessText(elemMult);
    const burnDmg = Math.max(1, Math.floor(this.character.attack * 0.4));
    this.applyMonsterStatus('ignited', { turnsLeft: 3, burnDamage: burnDmg });
    this.addLog(`Ignition → ${dmg} fire damage${note ? ' — ' + note : ''}. Burns ${burnDmg}/turn for 3 turns.`, 'player-skill');
  }

  _doFrostNova() {
    const { dmg, elemMult } = this._dealDamageToMonster(1.0, ELEMENTS.WATER, false);
    const note = effectivenessText(elemMult);
    this.applyMonsterStatus('frozen', { actionsLeft: 2 });
    this.addLog(`Frost Nova → ${dmg} water damage${note ? ' — ' + note : ''}. Frozen for 2 actions!`, 'player-skill');
  }

  _doDischarge() {
    const statusCount = this.activeMonsterStatusCount();
    const power = 2.0 + 0.5 * statusCount;
    const { dmg, elemMult } = this._dealDamageToMonster(power, ELEMENTS.NEUTRAL, false);
    const note = effectivenessText(elemMult);
    this.addLog(`Discharge → ${dmg} damage (${power.toFixed(1)}× · ${statusCount} status${statusCount !== 1 ? 'es' : ''})${note ? ' — ' + note : ''}.`, 'player-skill');
  }

  _doArcaneVeil() {
    this.veilActive = true;
    this.addLog('Arcane Veil raised — next monster hit absorbed (+2⚡).', 'player-skill');
  }

  // ── Other player actions ──────────────────────────────────────────────────

  useItem(itemId) {
    if (!this.isPlayerTurn()) return;
    this.tickPlayerStatuses();
    const item = this.character.consumeItem(itemId);
    if (!item) { this.addLog('Cannot use that item.', 'warning'); return; }
    if (item.healHp) {
      this.character.heal(item.healHp);
      this.addLog(`${item.name} — restored ${item.healHp} HP.`, 'heal');
    }
    if (item.healImpetus) {
      const gained = this.gainImpetus(item.healImpetus);
      this.addLog(`${item.name} — +${gained}⚡ Impetus (${this.impetus}/${this.maxImpetus}).`, 'heal');
    }
    this.subScreen = null;
    this._afterPlayerAct();
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

  switchClass(cls) {
    if (this.impetus < 2) {
      this.addLog('Not enough Impetus to switch class (need 2⚡).', 'warning');
      return false;
    }
    this.spendImpetus(2);
    const currentHp = this.character.hp;
    this.character.setClass(cls);
    this.character.hp = currentHp;
    this.stanceActive = false;
    this.veilActive   = false;
    this.subScreen    = null;
    this.addLog(`Switched to ${cls.icon} ${cls.name}! (${this.impetus}/${this.maxImpetus}⚡ remaining)`, 'passive');
    return true;
  }

  // ── After player acts ─────────────────────────────────────────────────────

  _afterPlayerAct() {
    if (!this.monster.isAlive()) {
      this.goldEarned = this.monster.goldDrop();
      this.xpEarned   = this.monster.xpReward;
      this.state      = 'won';
      this.addLog(`You defeated ${this.monster.name}! +${this.goldEarned}⚜`, 'victory');
      return;
    }
    this.monsterTurn();
  }

  // ── Monster turn ──────────────────────────────────────────────────────────

  monsterTurn() {
    if (this.state !== 'active') return;

    this.tickMonsterStatuses();

    if (!this.monster.isAlive()) {
      this.goldEarned = this.monster.goldDrop();
      this.xpEarned   = this.monster.xpReward;
      this.state      = 'won';
      this.addLog(`${this.monster.name} succumbs to the flames! +${this.goldEarned}⚜`, 'victory');
      return;
    }

    // Stunned: skip action
    if (this.statuses.monster.stunned) {
      const st = this.statuses.monster.stunned;
      st.turnsLeft--;
      if (st.turnsLeft <= 0) delete this.statuses.monster.stunned;
      this.addLog(`${this.monster.name} is stunned and cannot act.`, 'info');
      return;
    }

    // Frozen: skip action
    if (this.statuses.monster.frozen) {
      const fr = this.statuses.monster.frozen;
      fr.actionsLeft--;
      if (fr.actionsLeft <= 0) delete this.statuses.monster.frozen;
      this.addLog(`${this.monster.name} is frozen and cannot act.`, 'info');
      return;
    }

    // Monster chooses and executes attack
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
      raw = Math.floor(this.monster.attack * mult);
      buildLog = dmg => `${this.monster.name} attacks for ${dmg} damage.`;
    }

    // Veil: absorb the hit entirely
    if (this.veilActive) {
      this.veilActive = false;
      const gained = this.gainImpetus(2);
      this.addLog(`${buildLog(0).replace(/\d+ damage/, '— Arcane Veil absorbs the blow!')} +${gained}⚡`, 'passive');
      return;
    }

    // Brace: halve damage, clear stance
    const wasStance = this.stanceActive;
    if (wasStance) {
      raw = Math.floor(raw * 0.5);
      this.stanceActive = false;
    }

    const prevHp = this.character.hp;
    const dmg    = this.character.takeDamage(raw);
    this.addLog(buildLog(dmg), 'monster');

    if (wasStance) {
      this.addLog('Brace absorbs half the blow!', 'passive');
    }

    // Unbreakable Will: trigger when HP first crosses below 30%
    const threshold = Math.floor(this.character.maxHp * 0.3);
    if (!this.voluntasUsed && prevHp > threshold && this.character.hp <= threshold && this.character.hp > 0) {
      this.voluntasUsed = true;
      this.deathShield  = true;
      const gained = this.gainImpetus(3);
      this.applyPlayerStatus('fury', { turnsLeft: 3 });
      this.addLog(`⚡ Unbreakable Will! +${gained}⚡ Impetus. Fury active. Death shield engaged.`, 'passive');
    }

    // Death shield: negate killing blow
    if (!this.character.isAlive() && this.deathShield) {
      this.character.hp = 1;
      this.deathShield  = false;
      this.addLog('The death shield holds! You survive with 1 HP.', 'passive');
    }

    if (!this.character.isAlive()) {
      this.state = 'lost';
      this.addLog('You have fallen in battle...', 'defeat');
    }
  }

  isPlayerTurn() { return this.state === 'active'; }

  addLog(message, type = 'info') {
    this.log.push({ message, type });
    if (this.log.length > 16) this.log.shift();
  }
}
