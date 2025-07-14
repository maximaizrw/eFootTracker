export type CardStyleInfo = {
  id: string;
  nameFragment: string;
  tailwindClass: string; // This will now correspond to a CSS variable name
};

export const specialCardStyles: CardStyleInfo[] = [
  // Rules should be ordered from most specific to least specific
  {
    id: 'potwEuroMar24',
    nameFragment: "potw european club championship 21 mar '24",
    tailwindClass: 'potw-euro-mar24',
  },
  {
    id: 'potwClubIntl',
    nameFragment: "potw club international cup",
    tailwindClass: 'potw-club-intl',
  },
  {
    id: 'tsubasa',
    nameFragment: 'captain tsubasa collaboration campaign',
    tailwindClass: 'tsubasa-pink',
  },
  {
    id: 'spain2010',
    nameFragment: 'spain 2010',
    tailwindClass: 'spain-2010',
  },
  {
    id: 'euroPotw',
    nameFragment: "potw european club championship",
    tailwindClass: 'potw-euro',
  },
  {
    id: 'atalanta',
    nameFragment: 'atalanta bc 96-97',
    tailwindClass: 'atalanta-green',
  },
  {
    id: 'genericPotw',
    nameFragment: 'potw',
    tailwindClass: 'potw-green',
  },
  {
    id: 'startup',
    nameFragment: 'startup campaign',
    tailwindClass: 'startup-blue',
  },
];

export const getCardStyle = (cardName: string): CardStyleInfo | null => {
  if (!cardName) return null;
  const cardNameLower = cardName.toLowerCase();
  
  // The loop ensures more specific rules (earlier in the array) are matched first.
  for (const style of specialCardStyles) {
    if (cardNameLower.includes(style.nameFragment)) {
      return style;
    }
  }
  
  return null;
};
