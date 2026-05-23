import { Character } from './engine/character.js';
import { Dungeon } from './engine/dungeon.js';
import { Combat } from './engine/combat.js';
import { SHOP_ITEMS, WEAPON_UPGRADES, ARMOR_UPGRADES } from './data/items.js';
import { LORE_NPCS } from './data/lore.js';
import { CLASSES } from './data/classes.js';
import {
  renderHub, renderBetweenFloors, renderDungeon, renderCombat,
  renderShop, renderInn, renderBlacksmith, renderQuests, renderLore,
  renderGameOver, renderVictory, renderClassSelect, renderLoadout,
} from './ui/screens.js';

const SAVE_KEY = 'windvale_save';

const game = {
  // ── State ─────────────────────────────────────────────────────────────────
  character:           null,
  dungeon:             null,
  combat:              null,
  gold:                50,
  expeditionGold:      0,
  currentFloor:        1,
  bestFloor:           0,
  _lastExpeditionGold: 0,
  runNumber:           1,
  screen:              'hub',
  notification:        null,
  loreDialogue:        {},
  _loadout:            [],

  // ── Boot ──────────────────────────────────────────────────────────────────
  init() {
    this.load();
    this.character = new Character();
    this.applyPersistentClass();
    this.applyPersistentGear();
    this.render();
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.gold          = data.gold         ?? 50;
      this.runNumber     = data.runNumber    ?? 1;
      this.bestFloor     = data.bestFloor    ?? 0;
      this.loreDialogue  = data.loreDialogue ?? {};
      this._savedGear    = data.gear         ?? null;
      this._savedClassId = data.classId      ?? null;
      this._loadout      = data.loadout      ?? [];
    } catch { /* ignore corrupt save */ }
  },

  save() {
    const c = this.character;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      gold:         this.gold,
      runNumber:    this.runNumber,
      bestFloor:    this.bestFloor,
      loreDialogue: this.loreDialogue,
      classId:      c._class?.id ?? null,
      loadout:      this._loadout,
      gear: {
        weapon: c.weapon,
        armor:  c.armor,
      },
    }));
  },

  applyPersistentClass() {
    if (!this._savedClassId) return;
    const cls = CLASSES.find(c => c.id === this._savedClassId);
    if (cls) this.character.setClass(cls);
  },

  applyPersistentGear() {
    if (!this._savedGear) return;
    const { weapon, armor } = this._savedGear;
    if (weapon) this.character.weapon = weapon;
    if (armor)  this.character.armor  = armor;
  },

  // ── Rendering ─────────────────────────────────────────────────────────────
  render() {
    const app = document.getElementById('app');
    const map = {
      hub:              () => renderHub(this),
      'between-floors': () => renderBetweenFloors(this),
      'class-select':   () => renderClassSelect(this),
      'loadout':        () => renderLoadout(this),
      dungeon:          () => renderDungeon(this),
      combat:           () => renderCombat(this),
      shop:             () => renderShop(this),
      inn:              () => renderInn(this),
      blacksmith:       () => renderBlacksmith(this),
      quests:           () => renderQuests(this),
      lore:             () => renderLore(this),
      'game-over':      () => renderGameOver(this),
      victory:          () => renderVictory(this),
    };
    app.innerHTML = (map[this.screen] ?? map.hub)();
    const log = app.querySelector('.combat-log');
    if (log) log.scrollTop = 0;
  },

  navigate(screen) {
    this.notification = null;
    this.screen = screen;
    this.render();
  },

  notify(msg, type = '') {
    this.notification = type === 'warn' ? `<span style="color:#1a1208">${msg}</span>` : msg;
    this.render();
  },

  // ── Dungeon ───────────────────────────────────────────────────────────────
  enterDungeon() {
    // Ensure current class is always in the loadout
    const currentId = this.character._class?.id;
    if (currentId && !this._loadout.includes(currentId)) {
      this._loadout = [currentId, ...this._loadout];
    }
    this.expeditionGold = 0;
    this.currentFloor   = 1;
    this.dungeon        = new Dungeon(1, this.runNumber);
    this.navigate('dungeon');
  },

  descendFloor() {
    this.currentFloor++;
    this.dungeon = new Dungeon(this.currentFloor, this.runNumber);
    this.navigate('dungeon');
  },

  retreatToHub() {
    this.gold += this.expeditionGold;
    this.expeditionGold = 0;
    this.dungeon = null;
    this.save();
    this.navigate('hub');
  },

  _updateBestFloor() {
    if (this.currentFloor > this.bestFloor) this.bestFloor = this.currentFloor;
  },

  enterCombat() {
    const room = this.dungeon.current;
    this.combat = new Combat(this.character, room.monster);
    this.navigate('combat');
  },

  resolveEvent() {
    const ev = this.dungeon.current.event;
    const c  = this.character;
    let msg = '';

    if (ev.effect.goldBonus) {
      const gained = this.dungeon.addGold(ev.effect.goldBonus);
      this.expeditionGold += gained;
      msg = `+${gained}⚜ gold (at risk)`;
    } else if (ev.effect.healPercent) {
      const healed = Math.floor(c.maxHp * ev.effect.healPercent);
      c.heal(healed);
      msg = `+${healed} HP restored`;
    } else if (ev.effect.damage) {
      const dmg = c.takeDamage(ev.effect.damage);
      msg = `-${dmg} HP`;
    }

    this.dungeon.advance();

    if (this.dungeon.done) {
      this._updateBestFloor();
      if (this.dungeon.isFinalFloor) {
        this.completeDungeon();
      } else {
        this.notification = msg;
        this.navigate('between-floors');
      }
    } else {
      this.notification = msg;
      this.navigate('dungeon');
    }
  },

  fleeDungeon() {
    this.expeditionGold = 0;
    this.dungeon = null;
    this.navigate('hub');
  },

  completeDungeon() {
    this.runNumber++;
    this.gold += this.expeditionGold;
    this._lastExpeditionGold = this.expeditionGold;
    this.expeditionGold = 0;
    this.dungeon = null;
    this.save();
    this.navigate('victory');
  },

  // ── Combat actions ────────────────────────────────────────────────────────
  combatUseSkill(skillId) {
    const skill = this.character.skills.find(sk => sk.id === skillId);
    if (!skill) return;
    this.combat.executeSkill(skill);
    this.afterCombatAction();
  },

  combatItem(itemId) {
    this.combat.useItem(itemId);
    this.afterCombatAction();
  },

  combatFlee() {
    this.combat.flee();
    this.afterCombatAction();
  },

  combatSubScreen(name) {
    this.combat.subScreen = name;
    this.render();
  },

  afterCombatAction() {
    const state = this.combat.state;
    this.render();

    if (state === 'won') {
      const gold = this.dungeon.addGold(this.combat.goldEarned);
      this.expeditionGold += gold;
      const leveled = this.character.addXp(this.combat.xpEarned ?? 0);
      setTimeout(() => {
        this.dungeon.advance();
        if (this.dungeon.done) {
          this._updateBestFloor();
          if (this.dungeon.isFinalFloor) {
            this.completeDungeon();
          } else {
            if (leveled > 0) this.notification = `⬆ Level ${this.character.level}! +10 Max HP, +1 ATK.`;
            this.navigate('between-floors');
          }
        } else {
          if (leveled > 0) this.notification = `⬆ Level ${this.character.level}! +10 Max HP, +1 ATK.`;
          this.navigate('dungeon');
        }
      }, 1600);

    } else if (state === 'lost') {
      setTimeout(() => this.navigate('game-over'), 1600);

    } else if (state === 'fled') {
      setTimeout(() => this.navigate('dungeon'), 1000);
    }
  },

  returnAfterDeath() {
    this.character = new Character();
    this.applyPersistentClass();
    this.applyPersistentGear();
    this.dungeon        = null;
    this.combat         = null;
    this.expeditionGold = 0;
    this.currentFloor   = 1;
    this.save();
    this.navigate('hub');
  },

  // ── Loadout management ───────────────────────────────────────────────────
  toggleLoadout(classId) {
    const currentId = this.character._class?.id;
    if (classId === currentId) return;
    if (this._loadout.includes(classId)) {
      this._loadout = this._loadout.filter(id => id !== classId);
    } else {
      if (this._loadout.length >= 3) return;
      this._loadout = [...this._loadout, classId];
    }
    this.save();
    this.render();
  },

  combatSwitchClass(classId) {
    const cls = CLASSES.find(c => c.id === classId);
    if (!cls || classId === this.character._class?.id) return;
    if (this.combat.switchClass(cls)) this.afterCombatAction();
    else this.render();
  },

  // ── Class selection ───────────────────────────────────────────────────────
  selectClass(classId) {
    const oldMainId = this.character._class?.id ?? null;
    const cls = CLASSES.find(c => c.id === classId);
    if (!cls) return;
    this.character.setClass(cls);
    this.applyPersistentGear();
    this._savedClassId = classId;
    // Ensure new class is in loadout; if full, replace old main slot
    if (!this._loadout.includes(classId)) {
      if (this._loadout.length < 3) {
        this._loadout = [...this._loadout, classId];
      } else if (oldMainId && this._loadout.includes(oldMainId)) {
        this._loadout = this._loadout.map(id => id === oldMainId ? classId : id);
      } else {
        this._loadout = [classId, ...this._loadout.slice(1)];
      }
    }
    this.save();
    this.notification = `Now playing as ${cls.icon} ${cls.name}!`;
    this.navigate('hub');
  },

  // ── Hub: Inn ──────────────────────────────────────────────────────────────
  restAtInn() {
    const cost = Math.floor(this.character.maxHp * 0.5);
    if (this.gold < cost) return;
    this.gold -= cost;
    this.character.fullRestore();
    this.save();
    this.render();
  },

  // ── Hub: Shop ─────────────────────────────────────────────────────────────
  buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item || this.gold < item.cost) return;
    this.gold -= item.cost;
    this.character.addItem({ id: item.id, name: item.name, healHp: item.healHp, healImpetus: item.healImpetus });
    this.save();
    this.render();
  },

  // ── Hub: Blacksmith ───────────────────────────────────────────────────────
  upgradeWeapon() {
    const next = WEAPON_UPGRADES.find(u => u.level === this.character.weapon.level + 1);
    if (!next || this.gold < next.cost) return;
    this.gold -= next.cost;
    this.character.weapon = { name: next.name, attackBonus: next.attackBonus, level: next.level };
    this.save();
    this.render();
  },

  upgradeArmor() {
    const next = ARMOR_UPGRADES.find(u => u.level === this.character.armor.level + 1);
    if (!next || this.gold < next.cost) return;
    this.gold -= next.cost;
    this.character.armor = { name: next.name, defenseBonus: next.defenseBonus, level: next.level };
    this.save();
    this.render();
  },

  // ── Lore dialogue ─────────────────────────────────────────────────────────
  advanceLore(npcId) {
    const npc = LORE_NPCS.find(n => n.id === npcId);
    if (!npc) return;
    const current = this.loreDialogue[npcId] ?? 0;
    this.loreDialogue[npcId] = (current + 1) % npc.dialogue.length;
    this.save();
    this.render();
  },
};

window.game = game;
document.addEventListener('DOMContentLoaded', () => game.init());
