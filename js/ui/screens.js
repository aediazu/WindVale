import { SHOP_ITEMS, WEAPON_UPGRADES, ARMOR_UPGRADES } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { LORE_NPCS } from '../data/lore.js';
import { ELEMENT_ICON, ELEMENT_COLOR } from '../data/elements.js';
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

function impetusRow(current, max) {
  const pips = Array.from({ length: max }, (_, i) =>
    `<span class="impetus-pip${i < current ? ' impetus-pip-full' : ''}"></span>`
  ).join('');
  return `
    <div class="impetus-row">
      <span class="impetus-label">⚡ Impetus</span>
      <div class="impetus-pips">${pips}</div>
      <span class="impetus-label">${current}/${max}</span>
    </div>`;
}

function manaBar(current, max) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  return `
    <div class="mana-row">
      <span class="mana-label">🔮 Mana</span>
      <div class="mana-bar-track"><div class="mana-bar-fill" style="width:${pct}%"></div></div>
      <span class="mana-label">${current}/${max}</span>
    </div>`;
}

function statusBadgesHtml(statuses, flags) {
  const badges = [];
  const ms = statuses?.monster ?? {};
  const ps = statuses?.player ?? {};

  if (ms.vulnerable)   badges.push(`<span class="status-badge status-vulnerable">Vulnerable</span>`);
  if (ms.stunned)      badges.push(`<span class="status-badge status-stunned">Stunned</span>`);
  if (ms.ignited)      badges.push(`<span class="status-badge status-ignited">Ignited ${ms.ignited.turnsLeft}t · ${ms.ignited.burnDamage}/t</span>`);
  if (ms.frozen)       badges.push(`<span class="status-badge status-frozen">Frozen ×${ms.frozen.actionsLeft}</span>`);

  if (ps.fury)         badges.push(`<span class="status-badge status-fury">Fury (${ps.fury.turnsLeft}t)</span>`);
  if (flags?.stance)   badges.push(`<span class="status-badge status-stance">Brace</span>`);

  return badges.length ? `<div class="status-badges">${badges.join('')}</div>` : '';
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

function charMiniStats(c) {
  const xpPct = Math.min(100, (c.xp / c.xpToNextLevel) * 100);
  const itemsLeft = c.items.reduce((sum, i) => sum + i.quantity, 0);
  return `
    <div class="char-mini-stats">
      <span>Lv.${c.level}</span>
      <span>⚔ ${c.attack}</span>
      <span>🛡 ${c.defense}</span>
      <span>💊 ${itemsLeft}</span>
    </div>
    <div class="char-mini-xp">
      <div class="progress-track" style="height:3px">
        <div class="progress-fill" style="width:${xpPct}%"></div>
      </div>
      <span>${c.xp}/${c.xpToNextLevel} XP</span>
    </div>`;
}

// ── Screens ──────────────────────────────────────────────────────────────────

export function renderHub(s) {
  const c = s.character;
  const innCost = Math.floor(c.maxHp * 0.5);
  const notif = s.notification ? `<div class="notification">${s.notification}</div>` : '';
  const cls = c._class;
  const classLine = cls
    ? `<div style="font-size:0.75rem;color:var(--gold);padding-top:4px;">${cls.icon} ${cls.name}</div>`
    : `<div style="font-size:0.75rem;color:var(--warning);padding-top:4px;">⚠ No class selected — choose one below</div>`;
  const xpPct = c.xpToNextLevel > 0 ? (c.xp / c.xpToNextLevel) * 100 : 0;
  const levelLine = `
    <div style="font-size:0.75rem;color:var(--muted);padding-top:2px;">
      <span>Lv.${c.level} · ${c.xp}/${c.xpToNextLevel} XP</span>
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
        </div>
        <div style="margin:6px 0 2px">
          ${hpBar(c.hp, c.maxHp)}
        </div>
        <div class="btf-stat-row">
          <span>⚔ ATK ${c.attack}</span>
          <span>🛡 DEF ${c.defense}</span>
          <span>💊 Items: ${itemsLeft}</span>
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
    const effectDesc = ev.effect.goldBonus   ? `+${ev.effect.goldBonus} gold (at risk)`
      : ev.effect.healPercent                ? `Restores ${Math.round(ev.effect.healPercent * 100)}% HP`
      : ev.effect.damage                     ? `-${ev.effect.damage} HP`
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

  // ── Monster status badges
  const monsterBadges = statusBadgesHtml(combat.statuses, null);

  // ── Player status badges
  const playerBadges = statusBadgesHtml(
    { player: combat.statuses?.player ?? {} },
    { stance: combat.stanceActive }
  );

  // ── Skill grid
  function skillGridHtml() {
    return c.skills.map(sk => {
      if (sk.passive) {
        // Unbreakable Will state
        let stateLabel, stateClass;
        if (!combat.voluntasUsed && !combat.deathShield) {
          stateLabel = 'Ready'; stateClass = 'voluntas-ready';
        } else if (combat.deathShield) {
          stateLabel = 'Shield Active'; stateClass = 'voluntas-active';
        } else {
          stateLabel = 'Spent'; stateClass = 'voluntas-spent';
        }
        return `
          <div class="skill-passive-badge ${stateClass}">
            <div>
              <div class="skill-btn-name">${sk.name}</div>
              <div class="skill-btn-preview">${sk.preview}</div>
            </div>
            <span style="font-size:0.7rem;font-weight:bold">${stateLabel}</span>
          </div>`;
      }
      const canUse = combat.canUseSkill(sk);
      const costBadge = sk.manaCost > 0
        ? `<span class="skill-btn-cost skill-btn-cost-mana">${sk.manaCost}M</span>`
        : sk.impetusRequires > 0
          ? `<span class="skill-btn-cost">${sk.impetusRequires}⚡</span>`
          : '';
      const elemIcon = ELEMENT_ICON[sk.element] ?? '';
      return `
        <button class="skill-btn-combat" onclick="game.combatUseSkill('${sk.id}')"
          ${!canUse ? 'disabled' : ''}>
          <div class="skill-btn-name">${elemIcon} ${sk.name}</div>
          <div class="skill-btn-preview">${sk.preview}</div>
          ${costBadge}
        </button>`;
    }).join('');
  }

  let actionArea = '';
  if (done) {
    actionArea = `<div style="text-align:center;font-size:0.9rem;color:var(--muted)">Processing...</div>`;
  } else if (combat.subScreen === 'items') {
    if (c.items.length === 0) {
      actionArea = `<div style="text-align:center;color:var(--muted);font-size:0.9rem">No items.</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
    } else {
      const itemBtns = c.items.map(it => {
        const desc = it.healHp ? `+${it.healHp} HP` : it.healImpetus ? `+${it.healImpetus}⚡` : '';
        return `
          <button class="item-btn" onclick="game.combatItem('${it.id}')">
            <span>${it.name} ×${it.quantity}</span>
            <span style="font-size:0.8rem;color:var(--muted)">${desc}</span>
          </button>`;
      }).join('');
      actionArea = `
        <div class="item-list">${itemBtns}</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
    }
  } else if (combat.subScreen === 'switch') {
    const canSwitch = combat.impetus >= 2;
    const loadoutClasses = s._loadout
      .map(id => CLASSES.find(cl => cl.id === id))
      .filter(Boolean);
    const otherClasses = loadoutClasses.filter(cls => cls.id !== c._class?.id);

    if (otherClasses.length === 0) {
      // No second class configured — explain how to set it up
      const allOthers = CLASSES.filter(cl => cl.id !== c._class?.id);
      const suggestions = allOthers.map(cls => `
        <div class="csb-suggestion">
          <span class="csb-icon">${cls.icon}</span>
          <div class="csb-info">
            <div class="csb-name">${cls.name}</div>
            <div class="csb-passive">${cls.description.split('.')[0]}.</div>
          </div>
        </div>`).join('');
      actionArea = `
        <div class="switch-empty-msg">
          <div style="font-size:0.85rem;color:var(--gold);font-weight:bold;margin-bottom:6px">🔀 Class Switching</div>
          <div style="font-size:0.8rem;color:var(--muted);line-height:1.5;margin-bottom:10px">
            Add a second class to your <strong style="color:var(--text)">Loadout</strong> before entering the dungeon to switch mid-combat.
          </div>
          <div style="font-size:0.75rem;color:var(--muted);margin-bottom:6px">Available classes:</div>
          ${suggestions}
        </div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
    } else {
      const switchBtns = loadoutClasses.map(cls => {
        const isActive = cls.id === c._class?.id;
        return `
          <button class="class-switch-btn ${isActive ? 'class-switch-active' : ''}"
            ${isActive || !canSwitch ? 'disabled' : `onclick="game.combatSwitchClass('${cls.id}')"`}>
            <span class="csb-icon">${cls.icon}</span>
            <div class="csb-info">
              <div class="csb-name">${cls.name}${isActive ? ' <span class="csb-tag">Active</span>' : ''}</div>
              <div class="csb-passive">${cls.description.split('.')[0]}.</div>
              <div style="font-size:0.7rem;color:var(--muted);margin-top:2px">
                ❤ ${cls.stats.maxHp} · ⚔ ${cls.stats.baseAttack} · 🛡 ${cls.stats.baseDefense}
              </div>
            </div>
          </button>`;
      }).join('');
      actionArea = `
        <div style="font-size:0.8rem;color:var(--muted);margin-bottom:6px">
          Switch class — costs 2⚡
          ${!canSwitch ? '<span style="color:var(--warning)"> · need more Impetus</span>' : ''}
        </div>
        <div class="switch-list">${switchBtns}</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Back</button>`;
    }
  } else {
    const hasAlt = s._loadout.length > 1;
    const switchDisabled = !hasAlt || combat.impetus < 2;
    actionArea = `
      <div class="skill-grid-combat">${skillGridHtml()}</div>
      <div class="combat-bottom-row">
        <button class="action-btn" onclick="game.combatSubScreen('items')">🎒 Items</button>
        <button class="action-btn action-btn-switch" onclick="game.combatSubScreen('switch')"
          ${switchDisabled && hasAlt ? 'disabled' : ''}>🔀 Switch${hasAlt ? ' [2⚡]' : ''}</button>
        <button class="action-btn" onclick="game.combatFlee()">🏃 Flee</button>
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
            <div class="bar-fill bar-fill-hp" style="width:${m.hpPercent() * 100}%"></div>
          </div>
          <span class="stat-value">${m.hp}/${m.maxHp}</span>
        </div>
        <div class="monster-stats-row">
          <span>⚔ ${m.attack} ATK</span>
          <span>🛡 ${m.defense} DEF</span>
        </div>
        ${monsterBadges}
      </div>

      <div class="stat-section">
        ${hpBar(c.hp, c.maxHp)}
        ${impetusRow(combat.impetus, combat.maxImpetus)}
        ${c._class?.id === 'sorcerer' ? manaBar(c.mana, c.maxMana) : ''}
        ${playerBadges}
        ${charMiniStats(c)}
        ${c._class ? `<div class="active-class-badge">${c._class.icon} ${c._class.name}</div>` : ''}
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
  const full = c.hp === c.maxHp && c.mana === c.maxMana;

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
        ${manaBar(c.mana, c.maxMana)}
      </div>
      ${full
        ? `<div class="notification">Already fully restored.</div>`
        : `<button class="btn-primary" onclick="game.restAtInn()"
            ${s.gold < cost ? 'disabled' : ''}>
            Rest — ${cost}⚜ (Restore HP + Mana)
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
  const npcs = LORE_NPCS.map(npc => {
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

export function renderLoadout(s) {
  const currentId = s.character._class?.id ?? null;
  const loadout = s._loadout;
  const totalActive = loadout.length;

  const cards = CLASSES.map(cls => {
    const isMain    = cls.id === currentId;
    const inLoadout = loadout.includes(cls.id);
    const atMax     = totalActive >= 3 && !inLoadout;

    const passiveSkill = cls.skills.find(sk => sk.passive);
    const passiveLine  = passiveSkill
      ? `<div class="loadout-card-passive">${passiveSkill.name}: ${passiveSkill.preview}</div>`
      : `<div class="loadout-card-passive">${cls.description.split('.')[0]}.</div>`;

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
            ${passiveLine}
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
          Choose up to 3 classes for combat. Switch during battle for 2⚡ — stats and skills swap instantly. Impetus and buffs carry over.
          <br><strong style="color:var(--warning)">${totalActive}/3 active.</strong>
        </div>
      </div>
      ${cards}
    </div>`;
}

export function renderClassSelect(s) {
  const currentId = s.character._class?.id ?? null;

  function skillChip(sk) {
    if (sk.passive)              return ['Auto',      'csc-passive'];
    if (sk.manaCost > 0)         return [`${sk.manaCost}M`, 'csc-mana'];
    if (sk.impetusRequires > 0)  return [`${sk.impetusRequires}⚡`, 'csc-impetus'];
    return ['Free', 'csc-free'];
  }

  const cards = CLASSES.map(cls => {
    const isSelected = cls.id === currentId;
    const { maxHp, baseAttack, baseDefense } = cls.stats;
    const tagline = cls.description.split('. ')[0] + '.';

    const skillRows = cls.skills.map(sk => {
      const [chipLabel, chipClass] = skillChip(sk);
      const elemIcon = sk.element !== 'Neutral' ? (ELEMENT_ICON[sk.element] ?? '') : '';
      return `
        <div class="class-skill-row">
          <div class="class-skill-header">
            <span class="class-skill-chip ${chipClass}">${chipLabel}</span>
            <span class="class-skill-name-text">${elemIcon ? elemIcon + ' ' : ''}${sk.name}</span>
          </div>
          <div class="class-skill-effect">${sk.preview}</div>
        </div>`;
    }).join('');

    return `
      <div class="class-card${isSelected ? ' class-card-selected' : ''}" onclick="game.selectClass('${cls.id}')">
        <div class="class-card-header">
          <span class="class-card-icon">${cls.icon}</span>
          <div>
            <div class="class-card-name">${cls.name}${isSelected ? ' <span class="class-active-tag">Active</span>' : ''}</div>
            <div class="class-card-tagline">${tagline}</div>
          </div>
        </div>
        <div class="class-card-stats">
          <span>❤ ${maxHp}</span>
          <span>⚔ ${baseAttack}</span>
          <span>🛡 ${baseDefense}</span>
        </div>
        <div class="class-skill-list">${skillRows}</div>
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
        <div class="card-body">Tu clase persiste entre expediciones. Cambiar de clase en combate mantiene tu HP, equipamiento y oro.</div>
      </div>
      ${cards}
    </div>`;
}
