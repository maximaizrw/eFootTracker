export type CardStyleInfo = {
  id: string;
  nameFragment: string;
  tailwindClass: string;
};

export const specialCardStyles: CardStyleInfo[] = [
  // Most specific first
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
  // Less specific
  {
    id: 'euroPotw',
    nameFragment: "potw european club championship",
    tailwindClass: 'potw-euro',
  },
  {
    id: 'genericPotw',
    nameFragment: 'potw',
    tailwindClass: 'potw-green',
  },
  {
    id: 'tsubasa',
    nameFragment: 'captain tsubasa collaboration campaign',
    tailwindClass: 'tsubasa-pink',
  },
  {
    id: 'startup',
    nameFragment: 'startup campaign',
    tailwindClass: 'startup-blue',
  },
  {
    id: 'atalanta',
    nameFragment: 'atalanta bc 96-97',
    tailwindClass: 'atalanta-green',
  },
  {
    id: 'spain2010',
    nameFragment: 'spain 2010',
    tailwindClass: 'spain-2010',
  },
];

export const getCardStyle = (cardName: string): CardStyleInfo | null => {
  if (!cardName) return null;
  const cardNameLower = cardName.toLowerCase();
  
  // The loop ensures more specific name fragments are matched first if they are ordered correctly in the array.
  for (const style of specialCardStyles) {
    if (cardNameLower.includes(style.nameFragment)) {
      return style;
    }
  }
  
  return null;
};
