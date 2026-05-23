export const SHOP_ITEMS = [
  { id: 'potion',    name: 'Potion',      cost: 20,  healHp: 30,  description: 'Restores 30 HP' },
  { id: 'hi_potion', name: 'Hi-Potion',   cost: 45,  healHp: 70,  description: 'Restores 70 HP' },
  { id: 'ether',     name: 'Ether',       cost: 25,  healImpetus: 1,  description: 'Restores 1 Impetus' },
  { id: 'hi_ether',  name: 'Hi-Ether',    cost: 50,  healImpetus: 2,  description: 'Restores 2 Impetus' },
];

// Upgrade tiers: index = upgrade level (0=base already equipped, 1,2,3 = upgrades)
export const WEAPON_UPGRADES = [
  { level: 1, name: 'Iron Sword +1',  cost: 60,  attackBonus: 5  },
  { level: 2, name: 'Iron Sword +2',  cost: 120, attackBonus: 11 },
  { level: 3, name: 'Steel Sword +3', cost: 220, attackBonus: 20 },
];

export const ARMOR_UPGRADES = [
  { level: 1, name: 'Leather Armor +1', cost: 50,  defenseBonus: 4  },
  { level: 2, name: 'Leather Armor +2', cost: 100, defenseBonus: 9  },
  { level: 3, name: 'Chain Mail +3',    cost: 180, defenseBonus: 16 },
];
