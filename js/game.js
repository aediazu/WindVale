import { Character } from './engine/character.js';
import { Dungeon } from './engine/dungeon.js';
import { Combat } from './engine/combat.js';
import { SHOP_ITEMS, WEAPON_UPGRADES, ARMOR_UPGRADES } from './data/items.js';
import { LORE_NPCS } from './data/lore.js';
import {
  renderHub, renderAdventureSelect, renderDungeon, renderCombat,
  renderShop, renderInn, renderBlacksmith, renderQuests, renderLore,
  renderGameOver, renderVictory,
} from './ui/screens.js';

const SAVE_KEY = 'windvale_save';

const game = {
  // ── State ─────────────────────────────────────────────────────────────────
  character:    null,
  dungeon:      null,
  combat:       null,
  gold:         50,
  runNumber:    1,
  screen:       'hub',
  notification: null,
  loreDialogue: {},       // { npcId: dialogueIndex }

  // ── Boot ──────────────────────────────────────────────────────────────────
  init() {
    this.load();
    this.character = new Character();
    this.applyPersistentGear();
    this.render();
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.gold         = data.gold         ?? 50;
      this.runNumber    = data.runNumber    ?? 1;
      this.loreDialogue = data.loreDialogue ?? {};
      this._savedGear   = data.gear         ?? null;
    } catch { /* ignore corrupt save */ }
  },

  save() {
    const c = this.character;
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      gold:         this.gold,
      runNumber:    this.runNumber,
      loreDialogue: this.loreDialogue,
      gear: {
        weapon: c.weapon,
        armor:  c.armor,
      },
    }));
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
      hub:               () => renderHub(this),
      'adventure-select':() => renderAdventureSelect(this),
      dungeon:           () => renderDungeon(this),
      combat:            () => renderCombat(this),
      shop:              () => renderShop(this),
      inn:               () => renderInn(this),
      blacksmith:        () => renderBlacksmith(this),
      quests:            () => renderQuests(this),
      lore:              () => renderLore(this),
      'game-over':       () => renderGameOver(this),
      victory:           () => renderVictory(this),
    };
    app.innerHTML = (map[this.screen] ?? map.hub)();
    // Scroll log to top so newest entries are visible
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

  // ── Adventure ─────────────────────────────────────────────────────────────
  startAdventure(adventureId) {
    this.dungeon = new Dungeon(adventureId, this.runNumber);
    this.navigate('dungeon');
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
      this.gold += gained;
      msg = `+${gained}⚜ de oro`;
    } else if (ev.effect.healPercent) {
      const healed = Math.floor(c.maxHp * ev.effect.healPercent);
      c.heal(healed);
      msg = `+${healed} HP recuperado`;
    } else if (ev.effect.mpPercent) {
      const restored = Math.floor(c.maxMp * ev.effect.mpPercent);
      c.restoreMp(restored);
      msg = `+${restored} MP restaurado`;
    } else if (ev.effect.damage) {
      const dmg = c.takeDamage(ev.effect.damage);
      msg = `-${dmg} HP`;
    }

    this.save();
    this.dungeon.advance();

    if (this.dungeon.done) {
      this.completeDungeon();
    } else {
      this.notification = msg;
      this.navigate('dungeon');
    }
  },

  fleeDungeon() {
    this.dungeon = null;
    this.navigate('hub');
  },

  completeDungeon() {
    this.runNumber++;
    this.gold += this.dungeon.totalGold;
    this.save();
    this.navigate('victory');
  },

  // ── Combat actions ────────────────────────────────────────────────────────
  combatAttack() {
    this.combat.attack();
    this.afterCombatAction();
  },

  combatSkill(skillId) {
    const skill = this.character.skills.find(sk => sk.id === skillId);
    if (!skill) return;
    this.combat.useSkill(skill);
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
      this.gold += gold;
      this.save();
      setTimeout(() => {
        this.dungeon.advance();
        if (this.dungeon.done) { this.completeDungeon(); }
        else { this.navigate('dungeon'); }
      }, 1600);

    } else if (state === 'lost') {
      setTimeout(() => this.navigate('game-over'), 1600);

    } else if (state === 'fled') {
      setTimeout(() => this.navigate('dungeon'), 1000);
    }
  },

  returnAfterDeath() {
    // Soft death: gold and gear persist, character resets
    this.character = new Character();
    this.applyPersistentGear();
    this.dungeon  = null;
    this.combat   = null;
    this.runNumber = 1;
    this.save();
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
    this.character.addItem({ id: item.id, name: item.name, healHp: item.healHp, healMp: item.healMp });
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
