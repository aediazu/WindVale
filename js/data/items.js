export const SHOP_ITEMS = [
  { id: 'potion',    name: 'Poción',       cost: 20,  healHp: 30,  description: 'Recupera 30 HP' },
  { id: 'hi_potion', name: 'Poción Mayor', cost: 45,  healHp: 70,  description: 'Recupera 70 HP' },
  { id: 'ether',     name: 'Éter',         cost: 25,  healMp: 20,  description: 'Recupera 20 MP' },
  { id: 'hi_ether',  name: 'Éter Mayor',   cost: 50,  healMp: 45,  description: 'Recupera 45 MP' },
];

// Upgrade tiers: index = upgrade level (0=base already equipped, 1,2,3 = upgrades)
export const WEAPON_UPGRADES = [
  { level: 1, name: 'Espada de Hierro +1', cost: 60,  attackBonus: 5  },
  { level: 2, name: 'Espada de Hierro +2', cost: 120, attackBonus: 11 },
  { level: 3, name: 'Espada de Acero +3',  cost: 220, attackBonus: 20 },
];

export const ARMOR_UPGRADES = [
  { level: 1, name: 'Armadura de Cuero +1', cost: 50,  defenseBonus: 4  },
  { level: 2, name: 'Armadura de Cuero +2', cost: 100, defenseBonus: 9  },
  { level: 3, name: 'Cota de Malla +3',     cost: 180, defenseBonus: 16 },
];
