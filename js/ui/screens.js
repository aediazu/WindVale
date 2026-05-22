import { SHOP_ITEMS, WEAPON_UPGRADES, ARMOR_UPGRADES } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { LORE_NPCS } from '../data/lore.js';
import { ELEMENT_ICON, ELEMENT_COLOR, getMultiplier } from '../data/elements.js';
import { CLASSES } from '../data/classes.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function hpBar(current, max) {
  const pct = Math.max(0, current / max) * 100;
  return `
    <div class="stat-row">
      <span class="stat-label">HP</span>
      <div class="bar-wrap bar-hp-bg">
        <div class="bar-fill bar-fill-hp" style="width:${pct}%"></div>
      </div>
      <span class="stat-value">${current}/${max}</span>
    </div>`;
}

function mpBar(current, max) {
  const pct = Math.max(0, current / max) * 100;
  return `
    <div class="stat-row">
      <span class="stat-label">MP</span>
      <div class="bar-wrap bar-mp-bg">
        <div class="bar-fill bar-fill-mp" style="width:${pct}%"></div>
      </div>
      <span class="stat-value">${current}/${max}</span>
    </div>`;
}

function elBadge(element) {
  const color = ELEMENT_COLOR[element] ?? '#aaa';
  const icon  = ELEMENT_ICON[element]  ?? '?';
  return `<span class="el-badge" style="background:${color}">${icon} ${element}</span>`;
}

function diffClass(d) {
  if (d === 'Easy') return 'difficulty-easy';
  if (d === 'Normal') return 'difficulty-normal';
  return 'difficulty-hard';
}

function progressBar(done, total) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return `
    <div class="progress-bar">
      <span class="progress-label">Room ${done}/${total}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
    </div>`;
}

function previewAttack(c, m) {
  const minDmg = Math.max(1, Math.floor(c.attack * 0.9) - m.defense);
  const maxDmg = Math.max(1, Math.floor(c.attack * 1.1) - m.defense);
  return { minDmg, maxDmg };
}

function previewSkill(c, m, sk, surgeReady) {
  if (sk.buff) return { type: 'buff', bonus: sk.buff.bonusDamage };
  if (sk.selfHeal && !sk.power) return { type: 'heal', value: sk.selfHeal };
  let power = sk.power;
  if (surgeReady && c.classPassive === 'arcane_surge') power *= 1.6;
  if (c.classPassive === 'earthbond' && sk.element === 'Earth') power *= 1.2;
  let mult = getMultiplier(sk.element, m.element);
  if (c.classPassive === 'dragonhunter' && m.element === 'Fire') mult *= 1.25;
  const dmg = Math.max(1, Math.floor(c.attack * power * mult) - m.defense);
  return { type: 'damage', value: dmg, mult };
}

function charMiniStats(c) {
  const xpPct = Math.min(100, (c.xp / c.xpToNextLevel) * 100);
  const pts = c.availableSkillPoints;
  const itemsLeft = c.items.reduce((sum, i) => sum + i.quantity, 0);
  return `
    <div class="char-mini-stats">
      <span>Lv.${c.level}</span>
      <span>⚔ ${c.attack}</span>
      <span>🛡 ${c.defense}</span>
      <span>💊 ${itemsLeft}</span>
      ${pts > 0 ? `<span style="color:var(--warning);font-weight:bold">+${pts}pts!</span>` : ''}
    </div>
    <div class="char-mini-xp">
      <div class="progress-track" style="height:3px">
        <div class="progress-fill" style="width:${xpPct}%"></div>
      </div>
      <span>${c.xp}/${c.xpToNextLevel} XP</span>
    </div>`;
}

// ── Skill tree helpers ────────────────────────────────────────────────────────

function skillNodeHtml(sk, state, classSkillTree) {
  const isUnlocked  = state === 'unlocked';
  const isAvailable = state === 'available';
  let effectLine;
  if (sk.buff) {
    effectLine = `Summons ${sk.buff.label} · +${sk.buff.bonusDamage} dmg/action · ${sk.mpCost} MP`;
  } else if (sk.selfHeal && !sk.power) {
    effectLine = `Heals ${sk.selfHeal} HP · ${sk.mpCost} MP`;
  } else if (sk.selfHeal && sk.power) {
    effectLine = `${sk.power}× ATK + heals ${sk.selfHeal} HP · ${sk.mpCost} MP`;
  } else {
    effectLine = `${sk.power}× ATK${sk.drain ? ` + drain ${Math.round(sk.drain * 100)}%` : ''} · ${sk.mpCost} MP`;
  }
  const reqNames = sk.requires.map(id => {
    const found = classSkillTree.find(s => s.id === id);
    return found ? found.name : id;
  }).join(', ');
  return `
    <div class="skill-node ${isUnlocked ? 'skill-node-unlocked' : isAvailable ? 'skill-node-available' : 'skill-node-locked'}"
      ${isAvailable ? `onclick="game.unlockSkill('${sk.id}')"` : ''}>
      <div class="skill-node-header">
        <span>${ELEMENT_ICON[sk.element]} ${sk.name}</span>
        ${isUnlocked
          ? '<span style="color:var(--gold)">✓</span>'
          : isAvailable
            ? '<span class="skill-node-cost">1 pt →</span>'
            : '<span style="opacity:0.5">🔒</span>'}
      </div>
      <div class="skill-node-effect">${effectLine}</div>
      <div class="skill-node-desc">${sk.description}</div>
      ${sk.requires.length ? `<div style="font-size:0.72rem;color:var(--muted)">Requires: ${reqNames}</div>` : ''}
    </div>`;
}

// ── Screens ──────────────────────────────────────────────────────────────────

export function renderHub(s) {
  const c = s.character;
  const innCost = Math.floor(c.maxHp * 0.5);
  const notif = s.notification ? `<div class="notification">${s.notification}</div>` : '';
  const cls = c._class;
  const classLine = cls
    ? `<div style="font-size:0.75rem;color:var(--gold);padding-top:4px;">${cls.icon} ${cls.name} <span style="color:var(--muted)">· ${cls.passiveDesc}</span></div>`
    : `<div style="font-size:0.75rem;color:var(--warning);padding-top:4px;">⚠ No class selected — choose one below</div>`;
  const xpPct = c.xpToNextLevel > 0 ? (c.xp / c.xpToNextLevel) * 100 : 0;
  const pts = c.availableSkillPoints;
  const levelLine = `
    <div style="font-size:0.75rem;color:var(--muted);padding-top:2px;display:flex;gap:12px;align-items:center">
      <span>Lv.${c.level} · ${c.xp}/${c.xpToNextLevel} XP</span>
      ${pts > 0 ? `<span style="color:var(--warning);font-weight:bold">${pts} pt${pts > 1 ? 's' : ''} unspent!</span>` : ''}
    </div>
    <div class="progress-track" style="height:4px;margin-top:3px">
      <div class="progress-fill" style="width:${xpPct}%"></div>
    </div>`;
  return `
    <div class="screen">
      ${notif}
      <div class="top-bar">
        <h1>WindVale</h1>
        <span class="gold-badge">⚜ ${s.gold}</span>
        ${s.bestFloor > 0 ? `<span class="record-badge">Best: Floor ${s.bestFloor}</span>` : ''}
      </div>

      <div class="stat-section">
        ${hpBar(c.hp, c.maxHp)}
        ${mpBar(c.mp, c.maxMp)}
        <div style="font-size:0.75rem;color:var(--muted);display:flex;gap:16px;padding-top:2px;">
          <span>⚔ ATK ${c.attack}</span>
          <span>🛡 DEF ${c.defense}</span>
          <span>${c.weapon.name}</span>
          <span>${c.armor.name}</span>
        </div>
        ${classLine}
        ${levelLine}
      </div>

      <div class="hub-grid">
        <button class="hub-btn hub-btn-primary" onclick="game.enterDungeon()">
          ⚔ Enter the Dungeon
        </button>
        <button class="hub-btn" onclick="game.navigate('skill-tree')">
          <span>🌟</span>Skill Tree
        </button>
        <button class="hub-btn" onclick="game.navigate('shop')">
          <span>🏪</span>Shop
        </button>
        <button class="hub-btn" onclick="game.navigate('inn')">
          <span>🏠</span>Inn <small style="font-size:0.7rem;color:var(--muted)">(${innCost}⚜)</small>
        </button>
        <button class="hub-btn" onclick="game.navigate('blacksmith')">
          <span>⚒️</span>Blacksmith
        </button>
        <button class="hub-btn" onclick="game.navigate('quests')">
          <span>📜</span>Quests
        </button>
        <button class="hub-btn" onclick="game.navigate('lore')">
          <span>📖</span>Characters
        </button>
        <button class="hub-btn" onclick="game.navigate('class-select')" style="background:var(--panel)">
          <span>⚗</span>Change Class
        </button>
        <button class="hub-btn" onclick="game.navigate('loadout')" style="background:var(--panel)">
          <span>🔀</span>Loadout <small style="font-size:0.7rem;color:var(--muted)">(${s._loadout.length}/3)</small>
        </button>
      </div>
    </div>`;
}

export function renderBetweenFloors(s) {
  const nextFloor = s.currentFloor + 1;
  const c = s.character;
  const isApproachingFinal = nextFloor === 12;
  const warning = isApproachingFinal
    ? `<div class="notification" style="border-color:var(--danger);color:var(--danger)">
        ⚠ Floor 12 awaits. Nobody has returned from this depth.
       </div>`
    : '';

  const xpPct = Math.min(100, (c.xp / c.xpToNextLevel) * 100);
  const pts = c.availableSkillPoints;
  const itemsLeft = c.items.reduce((sum, i) => sum + i.quantity, 0);
  const hpPct = Math.round(c.hpPercent() * 100);

  return `
    <div class="screen result-screen">
      <div class="result-title victory">Floor ${s.currentFloor} Cleared!</div>

      <div class="btf-gold-row">
        <div class="btf-gold-cell">
          <span class="btf-gold-label">Hub gold (safe)</span>
          <strong class="btf-gold-value" style="color:var(--gold)">⚜ ${s.gold}</strong>
        </div>
        <div class="btf-gold-cell">
          <span class="btf-gold-label">Expedition gold (at risk)</span>
          <strong class="btf-gold-value" style="color:var(--warning)">⚜ ${s.expeditionGold}</strong>
        </div>
      </div>

      <div class="btf-char-panel">
        <div class="btf-char-header">
          ${c._class ? `${c._class.icon} ${c._class.name}` : 'Hero'} · Lv.${c.level}
          ${pts > 0 ? `<span class="btf-pts-badge">${pts} pt${pts > 1 ? 's' : ''} to spend</span>` : ''}
        </div>
        <div style="margin:6px 0 2px">
          ${hpBar(c.hp, c.maxHp)}
        </div>
        <div style="margin-bottom:6px">
          ${mpBar(c.mp, c.maxMp)}
        </div>
        <div class="btf-stat-row">
          <span>⚔ ATK ${c.attack}</span>
          <span>🛡 DEF ${c.defense}</span>
          <span>💊 Items: ${itemsLeft}</span>
          <span>✨ Skills: ${c._unlockedSkills.size}</span>
        </div>
        <div style="margin-top:6px">
          <div style="font-size:0.72rem;color:var(--muted);margin-bottom:2px">XP · ${c.xp} / ${c.xpToNextLevel}</div>
          <div class="progress-track" style="height:5px">
            <div class="progress-fill" style="width:${xpPct}%"></div>
          </div>
        </div>
        <div style="font-size:0.75rem;color:var(--muted);margin-top:6px">
          HP at ${hpPct}% — ${hpPct < 40 ? '⚠ Low! Consider retreating.' : hpPct < 70 ? 'Manageable, but careful.' : 'Good shape for next floor.'}
        </div>
      </div>

      ${warning}
      <div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:320px">
        <button class="btn-danger" onclick="game.descendFloor()">
          ⬇ Descend to Floor ${nextFloor}
        </button>
        <button class="btn-success" onclick="game.retreatToHub()">
          ↩ Retreat to Hub — keep ⚜ ${s.expeditionGold}
        </button>
      </div>
    </div>`;
}

export function renderDungeon(s) {
  const d = s.dungeon;
  const prog = d.progress;
  const room = d.current;
  let roomContent = '';

  if (!room) {
    roomContent = `<div class="room-card"><div class="room-icon">🏆</div>
      <div class="room-name">Adventure complete!</div></div>`;
  } else if (room.type === 'event') {
    const ev = room.event;
    const effectDesc = ev.effect.goldBonus  ? `+${ev.effect.goldBonus} gold (at risk)`
      : ev.effect.healPercent               ? `Restores ${Math.round(ev.effect.healPercent*100)}% HP`
      : ev.effect.mpPercent                 ? `Restores ${Math.round(ev.effect.mpPercent*100)}% MP`
      : ev.effect.damage                    ? `-${ev.effect.damage} HP`
      : '';
    roomContent = `
      <div class="room-card">
        <div class="room-icon">✨</div>
        <div class="room-name">${ev.name}</div>
        <div class="room-desc">${ev.description}</div>
        <div style="font-size:0.85rem;color:var(--gold)">${effectDesc}</div>
        <button class="btn-primary" style="max-width:200px" onclick="game.resolveEvent()">Continue</button>
      </div>`;
  } else {
    const m = room.monster;
    const isBoss = room.type === 'boss';
    roomContent = `
      <div class="room-card" style="${isBoss ? 'border-color:var(--gold)' : ''}">
        <div class="room-icon">${isBoss ? '💀' : '⚔️'}</div>
        <div class="room-name">${isBoss ? 'BOSS: ' : ''}${m.name}</div>
        <div style="margin:4px 0">${elBadge(m.element)}</div>
        <div class="room-desc">${m.description}</div>
        <button class="btn-primary" style="max-width:200px" onclick="game.enterCombat()">Fight!</button>
      </div>`;
  }

  return `
    <div class="screen">
      <div class="top-bar">
        <span style="font-size:0.9rem;color:var(--gold)">Floor ${d.floorNumber} / 12</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
        <span class="record-badge" style="color:var(--warning)">+${s.expeditionGold}⚜ at risk</span>
      </div>
      ${progressBar(prog.done, prog.total)}
      <div class="stat-section" style="gap:6px">
        ${hpBar(s.character.hp, s.character.maxHp)}
        ${mpBar(s.character.mp, s.character.maxMp)}
        ${charMiniStats(s.character)}
      </div>
      ${roomContent}
      <button class="btn-secondary" onclick="game.fleeDungeon()">🏃 Abandon expedition (lose at-risk gold)</button>
    </div>`;
}

export function renderCombat(s) {
  const c = s.character;
  const m = s.combat.monster;
  const combat = s.combat;
  const done = combat.state !== 'active';

  const logEntries = combat.log.slice().reverse().map(e =>
    `<div class="log-entry log-${e.type}">${e.message}</div>`).join('');

  let actionArea = '';
  if (done) {
    actionArea = `<div style="text-align:center;font-size:0.9rem;color:var(--muted)">Processing...</div>`;
  } else if (combat.subScreen === 'skills') {
    const skillBtns = c.skills.map(sk => {
      const preview = previewSkill(c, m, sk, combat.surgeReady);
      let previewSpan;
      if (preview.type === 'buff') {
        previewSpan = `<span class="dmg-preview" style="color:var(--success)">+${preview.bonus}/turn</span>`;
      } else if (preview.type === 'heal') {
        previewSpan = `<span class="dmg-preview dmg-heal">+${preview.value} HP</span>`;
      } else {
        const effClass = preview.mult >= 1.5 ? 'dmg-super'
                       : preview.mult <= 0.5 ? 'dmg-resisted'
                       : preview.mult < 1.0  ? 'dmg-weak' : '';
        previewSpan = `<span class="dmg-preview ${effClass}">${preview.value}</span>`;
      }
      return `
        <button class="skill-btn" onclick="game.combatSkill('${sk.id}')"
          ${!c.canUseSkill(sk) ? 'disabled' : ''}>
          <span>${ELEMENT_ICON[sk.element]} ${sk.name}</span>
          <span style="display:flex;align-items:center;gap:6px">
            ${previewSpan}
            <span class="skill-cost">${sk.mpCost} MP</span>
          </span>
        </button>`;
    }).join('');
    actionArea = `
      <div class="skill-list">${skillBtns}</div>
      <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
  } else if (combat.subScreen === 'items') {
    if (c.items.length === 0) {
      actionArea = `<div style="text-align:center;color:var(--muted);font-size:0.9rem">No items.</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
    } else {
      const itemBtns = c.items.map(it => `
        <button class="item-btn" onclick="game.combatItem('${it.id}')">
          <span>${it.name} ×${it.quantity}</span>
          <span style="font-size:0.8rem;color:var(--muted)">${it.healHp ? `+${it.healHp} HP` : it.healMp ? `+${it.healMp} MP` : ''}</span>
        </button>`).join('');
      actionArea = `
        <div class="item-list">${itemBtns}</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
    }
  } else if (combat.subScreen === 'switch') {
    const loadoutClasses = s._loadout
      .map(id => CLASSES.find(cl => cl.id === id))
      .filter(Boolean);
    const switchBtns = loadoutClasses.map(cls => {
      const isActive = cls.id === c._class?.id;
      const savedState = s._unlockedSkillsByClass[cls.id];
      const skillCount = isActive ? c._unlockedSkills.size : (savedState ? (savedState.skills?.length ?? 0) : 0);
      return `
        <button class="class-switch-btn ${isActive ? 'class-switch-active' : ''}"
          ${isActive || combat._switchedThisTurn ? 'disabled' : `onclick="game.combatSwitchClass('${cls.id}')"`}>
          <span class="csb-icon">${cls.icon}</span>
          <div class="csb-info">
            <div class="csb-name">${cls.name}${isActive ? ' <span class="csb-tag">Active</span>' : ''}</div>
            <div class="csb-passive">${cls.passiveDesc}</div>
            <div class="csb-skills">${skillCount} skill${skillCount !== 1 ? 's' : ''} unlocked</div>
          </div>
        </button>`;
    }).join('');
    actionArea = `
      <div style="font-size:0.8rem;color:var(--muted);margin-bottom:6px">Switch to...</div>
      <div class="switch-list">${switchBtns}</div>
      <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
  } else {
    const { minDmg, maxDmg } = previewAttack(c, m);
    const attackRange = minDmg === maxDmg ? `${minDmg}` : `${minDmg}–${maxDmg}`;
    const hasSwitch = s._loadout.length > 1;
    actionArea = `
      <div class="action-grid">
        <button class="action-btn action-btn-attack" onclick="game.combatAttack()">
          ⚔️ Attack
          <span class="dmg-preview">${attackRange}</span>
        </button>
        <button class="action-btn" onclick="game.combatSubScreen('skills')">✨ Skills</button>
        <button class="action-btn" onclick="game.combatSubScreen('items')">🎒 Items</button>
        ${hasSwitch
          ? `<button class="action-btn action-btn-switch" onclick="game.combatSubScreen('switch')"
              ${combat._switchedThisTurn ? 'disabled' : ''}>🔀 Switch</button>`
          : `<button class="action-btn" onclick="game.combatFlee()">🏃 Flee</button>`}
        ${hasSwitch ? `<button class="action-btn" onclick="game.combatFlee()" style="grid-column:span 2">🏃 Flee</button>` : ''}
      </div>`;
  }

  return `
    <div class="screen">
      <div class="combat-monster">
        <div class="monster-name">${m.name} ${elBadge(m.element)}</div>
        <div class="monster-desc">${m.description}</div>
        <div class="stat-row">
          <span class="stat-label">HP</span>
          <div class="bar-wrap bar-hp-bg" style="height:18px">
            <div class="bar-fill bar-fill-hp" style="width:${m.hpPercent()*100}%"></div>
          </div>
          <span class="stat-value">${m.hp}/${m.maxHp}</span>
        </div>
        <div class="monster-stats-row">
          <span>⚔ ${m.attack} ATK</span>
          <span>🛡 ${m.defense} DEF</span>
        </div>
      </div>

      <div class="stat-section">
        ${hpBar(c.hp, c.maxHp)}
        ${mpBar(c.mp, c.maxMp)}
        ${charMiniStats(s.character)}
        ${c._class ? `<div class="active-class-badge">${c._class.icon} ${c._class.name}${s._loadout.length > 1 && !combat._switchedThisTurn ? ' · <span style="color:var(--muted);font-size:0.7rem;font-weight:normal">tap Switch to change</span>' : combat._switchedThisTurn ? ' · <span style="color:var(--muted);font-size:0.7rem;font-weight:normal">switched</span>' : ''}</div>` : ''}
        ${combat.persistentBuff ? `<div class="active-buff">🔮 ${combat.persistentBuff.label} · +${combat.persistentBuff.bonusDamage} dmg/action</div>` : ''}
        ${combat.furyStacks > 0 ? `<div class="active-buff" style="color:#f6ad55">⚔ Battle Fury · +${combat.furyBonus} ATK (${combat.furyStacks} stack${combat.furyStacks > 1 ? 's' : ''})</div>` : ''}
      </div>

      <div class="combat-log">${logEntries || '<div class="log-entry log-info">Combat begins!</div>'}</div>

      ${actionArea}
    </div>`;
}

export function renderShop(s) {
  const items = SHOP_ITEMS.map(item => `
    <div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.description}</div>
      </div>
      <button class="btn-buy" onclick="game.buyItem('${item.id}')"
        ${s.gold < item.cost ? 'disabled' : ''}>
        ${item.cost}⚜
      </button>
    </div>`).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">🏪 Shop</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card"><div class="card-body">Buy potions and ethers for your adventures.</div></div>
      ${items}
    </div>`;
}

export function renderInn(s) {
  const c = s.character;
  const cost = Math.floor(c.maxHp * 0.5);
  const full = c.hp === c.maxHp && c.mp === c.maxMp;

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">🏠 Inn</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card">
        <div class="card-title">Traveler's Inn</div>
        <div class="card-body">"A good rest is worth more than any potion." — Rosalind</div>
      </div>
      <div class="stat-section">
        ${hpBar(c.hp, c.maxHp)}
        ${mpBar(c.mp, c.maxMp)}
      </div>
      ${full
        ? `<div class="notification">Already at full HP and MP.</div>`
        : `<button class="btn-primary" onclick="game.restAtInn()"
            ${s.gold < cost ? 'disabled' : ''}>
            Rest — ${cost}⚜ (Restore all HP/MP)
          </button>
          ${s.gold < cost ? '<div class="notification warn">Not enough gold.</div>' : ''}`}
    </div>`;
}

export function renderBlacksmith(s) {
  const c = s.character;
  const wLevel = c.weapon.level;
  const aLevel = c.armor.level;
  const nextW = WEAPON_UPGRADES.find(u => u.level === wLevel + 1);
  const nextA = ARMOR_UPGRADES.find(u => u.level === aLevel + 1);

  const weaponSection = `
    <div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${c.weapon.name}</div>
        <div class="shop-item-desc">ATK +${c.weapon.attackBonus} · Level ${wLevel}/3</div>
        ${nextW ? `<div class="shop-item-desc" style="color:var(--gold)">Next: ${nextW.name} → ATK +${nextW.attackBonus}</div>` : '<div class="shop-item-desc">Max level</div>'}
      </div>
      ${nextW
        ? `<button class="btn-buy" onclick="game.upgradeWeapon()" ${s.gold < nextW.cost ? 'disabled' : ''}>${nextW.cost}⚜</button>`
        : `<span style="font-size:0.8rem;color:var(--gold)">MAX</span>`}
    </div>`;

  const armorSection = `
    <div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${c.armor.name}</div>
        <div class="shop-item-desc">DEF +${c.armor.defenseBonus} · Level ${aLevel}/3</div>
        ${nextA ? `<div class="shop-item-desc" style="color:var(--gold)">Next: ${nextA.name} → DEF +${nextA.defenseBonus}</div>` : '<div class="shop-item-desc">Max level</div>'}
      </div>
      ${nextA
        ? `<button class="btn-buy" onclick="game.upgradeArmor()" ${s.gold < nextA.cost ? 'disabled' : ''}>${nextA.cost}⚜</button>`
        : `<span style="font-size:0.8rem;color:var(--gold)">MAX</span>`}
    </div>`;

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">⚒️ Blacksmith</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card"><div class="card-body">Upgrade your weapon and armor. Equipment persists between runs.</div></div>
      <div style="font-size:0.85rem;color:var(--muted);padding:4px 0">⚔ Weapon</div>
      ${weaponSection}
      <div style="font-size:0.85rem;color:var(--muted);padding:4px 0">🛡 Armor</div>
      ${armorSection}
    </div>`;
}

export function renderQuests(s) {
  const cards = QUESTS.map(q => `
    <div class="quest-card">
      <div class="quest-header">
        <div class="quest-name">${q.name}</div>
        <div class="quest-reward">+${q.reward}⚜</div>
      </div>
      <div class="quest-objective">📍 ${q.objective}</div>
      <div class="quest-desc">${q.description}</div>
      <div style="margin-top:6px;font-size:0.78rem" class="${diffClass(q.difficulty)}">${q.difficulty}</div>
    </div>`).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">📜 Quests</span>
      </div>
      <div class="card"><div class="card-body">Available quests in WindVale. Complete adventures to progress.</div></div>
      ${cards}
    </div>`;
}

export function renderLore(s) {
  const npcs = LORE_NPCS.map((npc, i) => {
    const dialogueIdx = s.loreDialogue?.[npc.id] ?? 0;
    return `
      <div class="npc-card" onclick="game.advanceLore('${npc.id}')">
        <div class="npc-header">
          <span class="npc-icon">${npc.icon}</span>
          <div>
            <div class="npc-name">${npc.name}</div>
            <div class="npc-role">${npc.role}</div>
          </div>
        </div>
        <div class="npc-dialogue">"${npc.dialogue[dialogueIdx]}"</div>
        <div style="font-size:0.75rem;color:var(--muted);margin-top:8px;text-align:right">
          ${dialogueIdx + 1}/${npc.dialogue.length} · Tap to continue
        </div>
      </div>`;
  }).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">📖 Characters</span>
      </div>
      ${npcs}
    </div>`;
}

export function renderGameOver(s) {
  const recordLine = s.bestFloor > 0
    ? `<div style="font-size:0.85rem;color:var(--muted);margin-top:6px">Best floor reached: ${s.bestFloor}</div>`
    : '';
  return `
    <div class="screen result-screen">
      <div class="result-title defeat">You fell in battle</div>
      <div class="result-body">
        Your expedition gold is lost to the dungeon.<br>
        <strong style="color:var(--gold)">Hub gold (safe): ⚜ ${s.gold}</strong>
        ${recordLine}
      </div>
      <div class="card" style="width:100%">
        <div class="card-body">Return to the hub, upgrade your gear, and descend again.</div>
      </div>
      <button class="btn-primary" style="max-width:280px" onclick="game.returnAfterDeath()">Return to hub</button>
    </div>`;
}

export function renderVictory(s) {
  return `
    <div class="screen result-screen">
      <div class="result-title victory">The Dungeon is Conquered!</div>
      <div class="result-body">
        The Dungeon's Heart has been destroyed.<br>
        <strong style="color:var(--gold)">+${s._lastExpeditionGold}⚜ earned</strong><br>
        <div style="font-size:0.85rem;color:var(--muted);margin-top:6px">
          Best floor reached: ${s.bestFloor}
        </div>
      </div>
      <button class="btn-primary" style="max-width:280px" onclick="game.navigate('hub')">Return to hub</button>
    </div>`;
}

export function renderSkillTree(s) {
  const c   = s.character;
  const cls = c._class;
  if (!cls) {
    return `
      <div class="screen">
        <div class="top-bar">
          <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
          <span style="color:var(--gold)">🌟 Skill Tree</span>
        </div>
        <div class="card"><div class="card-body">Select a class first to access the skill tree.</div></div>
      </div>`;
  }

  const tree = cls.skillTree;
  const pts  = c.availableSkillPoints;
  const xpPct = Math.min(100, (c.xp / c.xpToNextLevel) * 100);

  const branchData = cls.branches ?? { a: { name: 'Path A', lore: '' }, b: { name: 'Path B', lore: '' } };

  function branchStatus(branch) {
    if (!c._lockedBranch) return '';
    if (c._lockedBranch === branch) return 'locked';
    return 'chosen';
  }

  function branchHeader(branch) {
    const { name, lore } = branchData[branch];
    const status = branchStatus(branch);
    const statusTag = status === 'locked'
      ? '<span class="branch-status-tag branch-status-locked">🔒 Path Closed</span>'
      : status === 'chosen'
        ? '<span class="branch-status-tag branch-status-chosen">✓ Your Path</span>'
        : '';
    return `
      <div class="branch-header-block ${status === 'locked' ? 'branch-block-locked' : status === 'chosen' ? 'branch-block-chosen' : ''}">
        <div class="branch-title-row">
          <span class="branch-title">${name}</span>
          ${statusTag}
        </div>
        <div class="branch-lore">${lore}</div>
      </div>`;
  }

  function renderBranch(branch) {
    const skills = tree.filter(sk => sk.branch === branch).sort((a, b) => a.tier - b.tier);
    const nodes = skills.map(sk => {
      const unlocked  = c._unlockedSkills.has(sk.id);
      const available = !unlocked && c.canUnlockSkill(sk.id);
      return skillNodeHtml(sk, unlocked ? 'unlocked' : available ? 'available' : 'locked', tree);
    }).join('');
    return `
      <div class="branch-section">
        ${branchHeader(branch)}
        <div style="display:flex;flex-direction:column;gap:8px">${nodes}</div>
      </div>`;
  }

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">🌟 Skill Tree</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="stat-section" style="gap:5px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="color:var(--gold);font-weight:bold">${cls.icon} ${cls.name}</span>
          <span style="font-size:0.85rem">Lv.${c.level} ·
            ${pts > 0
              ? `<strong style="color:var(--warning)">${pts} pt${pts > 1 ? 's' : ''} to spend</strong>`
              : '<span style="color:var(--muted)">no points</span>'}
          </span>
        </div>
        <div style="font-size:0.75rem;color:var(--muted)">${c.xp} / ${c.xpToNextLevel} XP to next level</div>
        <div class="progress-track" style="height:6px">
          <div class="progress-fill" style="width:${xpPct}%"></div>
        </div>
        ${c.element !== 'Neutral' ? `<div style="font-size:0.75rem;color:#f6ad55;margin-top:2px">🔥 Dragon Path active — you are Fire element</div>` : ''}
        ${!c._lockedBranch ? '<div style="font-size:0.72rem;color:var(--muted);margin-top:2px">Unlock a tier-2 skill to commit to that path — the other will close forever.</div>' : ''}
      </div>
      ${renderBranch('a')}
      ${renderBranch('b')}
    </div>`;
}

export function renderLoadout(s) {
  const currentId = s.character._class?.id ?? null;
  const loadout = s._loadout;
  const totalActive = loadout.length;

  const cards = CLASSES.map(cls => {
    const isMain    = cls.id === currentId;
    const inLoadout = loadout.includes(cls.id);
    const atMax     = totalActive >= 3 && !inLoadout;
    const savedState = s._unlockedSkillsByClass[cls.id];
    const skillCount = isMain ? s.character._unlockedSkills.size : (savedState ? (savedState.skills?.length ?? 0) : 0);

    let actionBtn;
    if (isMain) {
      actionBtn = `<span class="loadout-tag">Main</span>`;
    } else if (inLoadout) {
      actionBtn = `<button class="loadout-remove-btn" onclick="game.toggleLoadout('${cls.id}')">Remove</button>`;
    } else {
      actionBtn = `<button class="loadout-add-btn" onclick="game.toggleLoadout('${cls.id}')"
        ${atMax ? 'disabled' : ''}>Add${atMax ? ' (max 3)' : ''}</button>`;
    }

    return `
      <div class="loadout-card ${inLoadout || isMain ? 'loadout-card-active' : ''}">
        <div class="loadout-card-left">
          <span class="loadout-card-icon">${cls.icon}</span>
          <div>
            <div class="loadout-card-name">${cls.name}</div>
            <div class="loadout-card-passive">${cls.passiveDesc}</div>
            <div class="loadout-card-info">${skillCount} skill${skillCount !== 1 ? 's' : ''} unlocked</div>
          </div>
        </div>
        ${actionBtn}
      </div>`;
  }).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">🔀 Loadout</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card">
        <div class="card-body">
          Choose up to 3 classes for combat. During battle, switch freely on your turn — stats, passives and unlocked skills swap instantly. Only one switch per monster turn.
          <br><strong style="color:var(--warning)">${totalActive}/3 active.</strong>
        </div>
      </div>
      ${cards}
    </div>`;
}

export function renderClassSelect(s) {
  const currentId = s.character._class?.id ?? null;

  const cards = CLASSES.map(cls => {
    const isSelected = cls.id === currentId;
    const skillNames = cls.skillTree.filter(sk => sk.tier === 1).map(sk => sk.name).join(', ');
    const { maxHp, maxMp, baseAttack, baseDefense } = cls.stats;
    return `
      <div class="class-card${isSelected ? ' class-card-selected' : ''}" onclick="game.selectClass('${cls.id}')">
        <div class="class-card-header">
          <span class="class-card-icon">${cls.icon}</span>
          <div>
            <div class="class-card-name">${cls.name}${isSelected ? ' <span class="class-active-tag">Active</span>' : ''}</div>
            <div class="class-card-passive">${cls.passiveDesc}</div>
          </div>
        </div>
        <div class="class-card-desc">${cls.description}</div>
        <div class="class-card-stats">
          <span>❤ ${maxHp}</span>
          <span>💧 ${maxMp}</span>
          <span>⚔ ${baseAttack}</span>
          <span>🛡 ${baseDefense}</span>
        </div>
        <div class="class-card-skills">Skills: ${skillNames} (${cls.skillTree.length} in tree)</div>
      </div>`;
  }).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Back</button>
        <span style="color:var(--gold)">⚗ Choose Class</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card">
        <div class="card-body">Your class persists between runs. Switching resets HP/MP to the new class values but keeps your gear and gold.</div>
      </div>
      ${cards}
    </div>`;
}
