import { ADVENTURES } from '../engine/dungeon.js';
import { SHOP_ITEMS, WEAPON_UPGRADES, ARMOR_UPGRADES } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { LORE_NPCS } from '../data/lore.js';
import { ELEMENT_ICON, ELEMENT_COLOR } from '../data/elements.js';

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
  if (d === 'Fácil') return 'difficulty-easy';
  if (d === 'Normal') return 'difficulty-normal';
  return 'difficulty-hard';
}

function progressBar(done, total) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return `
    <div class="progress-bar">
      <span class="progress-label">Sala ${done}/${total}</span>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
    </div>`;
}

// ── Screens ──────────────────────────────────────────────────────────────────

export function renderHub(s) {
  const c = s.character;
  const innCost = Math.floor(c.maxHp * 0.5);
  const notif = s.notification ? `<div class="notification">${s.notification}</div>` : '';
  return `
    <div class="screen">
      ${notif}
      <div class="top-bar">
        <h1>WindVale</h1>
        <span class="gold-badge">⚜ ${s.gold}</span>
        <span class="run-badge">Run #${s.runNumber}</span>
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
      </div>

      <div class="hub-grid">
        <button class="hub-btn hub-btn-primary" onclick="game.navigate('adventure-select')">
          ⚔ Aventura
        </button>
        <button class="hub-btn" onclick="game.navigate('shop')">
          <span>🏪</span>Tienda
        </button>
        <button class="hub-btn" onclick="game.navigate('inn')">
          <span>🏠</span>Posada <small style="font-size:0.7rem;color:var(--muted)">(${innCost}⚜)</small>
        </button>
        <button class="hub-btn" onclick="game.navigate('blacksmith')">
          <span>⚒️</span>Herrería
        </button>
        <button class="hub-btn" onclick="game.navigate('quests')">
          <span>📜</span>Misiones
        </button>
        <button class="hub-btn" onclick="game.navigate('lore')">
          <span>📖</span>Personajes
        </button>
      </div>
    </div>`;
}

export function renderAdventureSelect(s) {
  const cards = ADVENTURES.map(adv => `
    <div class="adventure-card" onclick="game.startAdventure('${adv.id}')">
      <div class="adventure-title">${adv.name}</div>
      <div class="adventure-meta">
        <span class="${diffClass(adv.difficulty)}">${adv.difficulty}</span>
        <span>${adv.rooms + 1} salas</span>
        <span>Oro ×${adv.goldMult.toFixed(1)}</span>
      </div>
      <div class="card-body">${adv.description}</div>
    </div>`).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Volver</button>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card"><div class="card-title">Elige una aventura</div>
        <div class="card-body">Cada aventura es una serie de combates procedurales. El oro y la dificultad escalan con los runs.</div>
      </div>
      ${cards}
    </div>`;
}

export function renderDungeon(s) {
  const d = s.dungeon;
  const prog = d.progress;
  const room = d.current;
  let roomContent = '';

  if (!room) {
    roomContent = `<div class="room-card"><div class="room-icon">🏆</div>
      <div class="room-name">¡Aventura completada!</div></div>`;
  } else if (room.type === 'event') {
    const ev = room.event;
    const effectDesc = ev.effect.goldBonus  ? `+${ev.effect.goldBonus} oro`
      : ev.effect.healPercent               ? `Restaura ${Math.round(ev.effect.healPercent*100)}% HP`
      : ev.effect.mpPercent                 ? `Restaura ${Math.round(ev.effect.mpPercent*100)}% MP`
      : ev.effect.damage                    ? `-${ev.effect.damage} HP`
      : '';
    roomContent = `
      <div class="room-card">
        <div class="room-icon">✨</div>
        <div class="room-name">${ev.name}</div>
        <div class="room-desc">${ev.description}</div>
        <div style="font-size:0.85rem;color:var(--gold)">${effectDesc}</div>
        <button class="btn-primary" style="max-width:200px" onclick="game.resolveEvent()">Continuar</button>
      </div>`;
  } else {
    const m = room.monster;
    const isBoss = room.type === 'boss';
    roomContent = `
      <div class="room-card" style="${isBoss ? 'border-color:var(--gold)' : ''}">
        <div class="room-icon">${isBoss ? '💀' : '⚔️'}</div>
        <div class="room-name">${isBoss ? 'JEFE: ' : ''}${m.name}</div>
        <div style="margin:4px 0">${elBadge(m.element)}</div>
        <div class="room-desc">${m.description}</div>
        <button class="btn-primary" style="max-width:200px" onclick="game.enterCombat()">¡Luchar!</button>
      </div>`;
  }

  return `
    <div class="screen">
      <div class="top-bar">
        <span style="font-size:0.9rem;color:var(--gold)">${d.adventure.name}</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      ${progressBar(prog.done, prog.total)}
      <div class="stat-section" style="gap:6px">
        ${hpBar(s.character.hp, s.character.maxHp)}
        ${mpBar(s.character.mp, s.character.maxMp)}
      </div>
      ${roomContent}
      <button class="btn-secondary" onclick="game.fleeDungeon()">🏃 Abandonar aventura</button>
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
    actionArea = `<div style="text-align:center;font-size:0.9rem;color:var(--muted)">Procesando...</div>`;
  } else if (combat.subScreen === 'skills') {
    const skillBtns = c.skills.map(sk => `
      <button class="skill-btn" onclick="game.combatSkill('${sk.id}')"
        ${!c.canUseSkill(sk) ? 'disabled' : ''}>
        <span>${ELEMENT_ICON[sk.element]} ${sk.name}</span>
        <span class="skill-cost">${sk.mpCost} MP</span>
      </button>`).join('');
    actionArea = `
      <div class="skill-list">${skillBtns}</div>
      <button class="btn-back" onclick="game.combatSubScreen(null)">← Volver</button>`;
  } else if (combat.subScreen === 'items') {
    if (c.items.length === 0) {
      actionArea = `<div style="text-align:center;color:var(--muted);font-size:0.9rem">Sin ítems.</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Volver</button>`;
    } else {
      const itemBtns = c.items.map(it => `
        <button class="item-btn" onclick="game.combatItem('${it.id}')">
          <span>${it.name} ×${it.quantity}</span>
          <span style="font-size:0.8rem;color:var(--muted)">${it.healHp ? `+${it.healHp} HP` : it.healMp ? `+${it.healMp} MP` : ''}</span>
        </button>`).join('');
      actionArea = `
        <div class="item-list">${itemBtns}</div>
        <button class="btn-back" onclick="game.combatSubScreen(null)">← Volver</button>`;
    }
  } else {
    actionArea = `
      <div class="action-grid">
        <button class="action-btn" onclick="game.combatAttack()">⚔️ Atacar</button>
        <button class="action-btn" onclick="game.combatSubScreen('skills')">✨ Habilidades</button>
        <button class="action-btn" onclick="game.combatSubScreen('items')">🎒 Ítems</button>
        <button class="action-btn" onclick="game.combatFlee()">🏃 Huir</button>
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
      </div>

      <div class="stat-section">
        ${hpBar(c.hp, c.maxHp)}
        ${mpBar(c.mp, c.maxMp)}
      </div>

      <div class="combat-log">${logEntries || '<div class="log-entry log-info">¡Comienza el combate!</div>'}</div>

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
        <button class="btn-back" onclick="game.navigate('hub')">← Volver</button>
        <span style="color:var(--gold)">🏪 Tienda</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card"><div class="card-body">Compra pociones y éters para tus aventuras.</div></div>
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
        <button class="btn-back" onclick="game.navigate('hub')">← Volver</button>
        <span style="color:var(--gold)">🏠 Posada</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card">
        <div class="card-title">Posada del Viajero</div>
        <div class="card-body">"Un buen descanso vale más que cualquier poción." — Rosalind</div>
      </div>
      <div class="stat-section">
        ${hpBar(c.hp, c.maxHp)}
        ${mpBar(c.mp, c.maxMp)}
      </div>
      ${full
        ? `<div class="notification">Ya estás al máximo de HP y MP.</div>`
        : `<button class="btn-primary" onclick="game.restAtInn()"
            ${s.gold < cost ? 'disabled' : ''}>
            Descansar — ${cost}⚜ (Restaura todo HP/MP)
          </button>
          ${s.gold < cost ? '<div class="notification warn">Oro insuficiente.</div>' : ''}`}
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
        <div class="shop-item-desc">ATK +${c.weapon.attackBonus} · Nivel ${wLevel}/3</div>
        ${nextW ? `<div class="shop-item-desc" style="color:var(--gold)">Siguiente: ${nextW.name} → ATK +${nextW.attackBonus}</div>` : '<div class="shop-item-desc">Nivel máximo</div>'}
      </div>
      ${nextW
        ? `<button class="btn-buy" onclick="game.upgradeWeapon()" ${s.gold < nextW.cost ? 'disabled' : ''}>${nextW.cost}⚜</button>`
        : `<span style="font-size:0.8rem;color:var(--gold)">MAX</span>`}
    </div>`;

  const armorSection = `
    <div class="shop-item">
      <div class="shop-item-info">
        <div class="shop-item-name">${c.armor.name}</div>
        <div class="shop-item-desc">DEF +${c.armor.defenseBonus} · Nivel ${aLevel}/3</div>
        ${nextA ? `<div class="shop-item-desc" style="color:var(--gold)">Siguiente: ${nextA.name} → DEF +${nextA.defenseBonus}</div>` : '<div class="shop-item-desc">Nivel máximo</div>'}
      </div>
      ${nextA
        ? `<button class="btn-buy" onclick="game.upgradeArmor()" ${s.gold < nextA.cost ? 'disabled' : ''}>${nextA.cost}⚜</button>`
        : `<span style="font-size:0.8rem;color:var(--gold)">MAX</span>`}
    </div>`;

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Volver</button>
        <span style="color:var(--gold)">⚒️ Herrería</span>
        <span class="gold-badge">⚜ ${s.gold}</span>
      </div>
      <div class="card"><div class="card-body">Mejora tu arma y armadura. El equipo persiste entre runs.</div></div>
      <div style="font-size:0.85rem;color:var(--muted);padding:4px 0">⚔ Arma</div>
      ${weaponSection}
      <div style="font-size:0.85rem;color:var(--muted);padding:4px 0">🛡 Armadura</div>
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
        <button class="btn-back" onclick="game.navigate('hub')">← Volver</button>
        <span style="color:var(--gold)">📜 Misiones</span>
      </div>
      <div class="card"><div class="card-body">Misiones disponibles en WindVale. Completa aventuras para progresar.</div></div>
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
          ${dialogueIdx + 1}/${npc.dialogue.length} · Toca para continuar
        </div>
      </div>`;
  }).join('');

  return `
    <div class="screen">
      <div class="top-bar">
        <button class="btn-back" onclick="game.navigate('hub')">← Volver</button>
        <span style="color:var(--gold)">📖 Personajes</span>
      </div>
      ${npcs}
    </div>`;
}

export function renderGameOver(s) {
  return `
    <div class="screen result-screen">
      <div class="result-title defeat">Caíste en batalla</div>
      <div class="result-body">
        Tu aventura terminó, pero el oro persiste.<br>
        <strong style="color:var(--gold)">Oro conservado: ${s.gold}⚜</strong>
      </div>
      <div class="card" style="width:100%">
        <div class="card-body">El run #${s.runNumber} termina aquí. Regresa al hub, mejora tu equipo, e inténtalo de nuevo.</div>
      </div>
      <button class="btn-primary" style="max-width:280px" onclick="game.returnAfterDeath()">Regresar al hub</button>
    </div>`;
}

export function renderVictory(s) {
  return `
    <div class="screen result-screen">
      <div class="result-title victory">¡Aventura completada!</div>
      <div class="result-body">
        Completaste <strong>${s.dungeon.adventure.name}</strong><br>
        <strong style="color:var(--gold)">+${s.dungeon.totalGold}⚜ ganados</strong>
      </div>
      <button class="btn-primary" style="max-width:280px" onclick="game.navigate('hub')">Volver al hub</button>
    </div>`;
}
