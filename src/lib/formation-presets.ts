
import type { FormationSlot } from './types';

export type FormationPreset = {
  name: string;
  slots: FormationSlot[];
};

// Field coordinate system:
// top: 0% is attacking goal, 100% is defending goal
// left: 0% is the left side of the field, 100% is the right side
const positionGrid: { [key: string]: { top: number; left: number } } = {
  'PT': { top: 90, left: 50 },
  
  'LD': { top: 75, left: 85 }, // Right Back
  'DFC-L': { top: 78, left: 35 }, // Left Center Back
  'DFC-R': { top: 78, left: 65 }, // Right Center Back
  'LI': { top: 75, left: 15 }, // Left Back
  
  'MDD': { top: 50, left: 80 }, // Right Mid
  'MCD': { top: 60, left: 50 }, // Center Defensive Mid
  'MC-L': { top: 50, left: 35 }, // Left Center Mid
  'MC-R': { top: 50, left: 65 }, // Right Center Mid
  'MDI': { top: 50, left: 20 }, // Left Mid
  
  'EXD': { top: 25, left: 85 }, // Right Winger
  'MO': { top: 35, left: 50 }, // Attacking Mid
  'SD': { top: 28, left: 50 }, // Second Striker
  'EXI': { top: 25, left: 15 }, // Left Winger
  
  'DC-L': { top: 15, left: 40 }, // Left Striker
  'DC-R': { top: 15, left: 60 }, // Right Striker
};

const getPos = (key: string) => positionGrid[key] || { top: 50, left: 50 };

export const formationPresets: FormationPreset[] = [
  {
    name: '4-3-3',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'LI', styles: [], ...getPos('LI') },
      { position: 'DFC', styles: [], ...getPos('DFC-L') },
      { position: 'DFC', styles: [], ...getPos('DFC-R') },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MCD', styles: [], ...getPos('MCD') },
      { position: 'MC', styles: [], top: 50, left: 30 }, // Left MC
      { position: 'MC', styles: [], top: 50, left: 70 }, // Right MC
      { position: 'EXI', styles: [], ...getPos('EXI') },
      { position: 'DC', styles: [], top: 15, left: 50 },
      { position: 'EXD', styles: [], ...getPos('EXD') },
    ],
  },
  {
    name: '4-4-2',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'LI', styles: [], ...getPos('LI') },
      { position: 'DFC', styles: [], ...getPos('DFC-L') },
      { position: 'DFC', styles: [], ...getPos('DFC-R') },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MDI', styles: [], ...getPos('MDI') },
      { position: 'MC', styles: [], ...getPos('MC-L') },
      { position: 'MC', styles: [], ...getPos('MC-R') },
      { position: 'MDD', styles: [], ...getPos('MDD') },
      { position: 'DC', styles: [], ...getPos('DC-L') },
      { position: 'DC', styles: [], ...getPos('DC-R') },
    ],
  },
    {
    name: '4-2-3-1',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'LI', styles: [], ...getPos('LI') },
      { position: 'DFC', styles: [], ...getPos('DFC-L') },
      { position: 'DFC', styles: [], ...getPos('DFC-R') },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MCD', styles: [], top: 60, left: 35 }, // Left MCD
      { position: 'MCD', styles: [], top: 60, left: 65 }, // Right MCD
      { position: 'MDI', styles: [], top: 45, left: 15 },
      { position: 'MO', styles: [], ...getPos('MO') },
      { position: 'MDD', styles: [], top: 45, left: 85 },
      { position: 'DC', styles: [], top: 15, left: 50 },
    ],
  },
  {
    name: '3-4-3',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'DFC', styles: [], top: 78, left: 20 }, // Left DFC
      { position: 'DFC', styles: [], top: 80, left: 50 }, // Center DFC
      { position: 'DFC', styles: [], top: 78, left: 80 }, // Right DFC
      { position: 'MDI', styles: [], ...getPos('MDI') },
      { position: 'MC', styles: [], ...getPos('MC-L') },
      { position: 'MC', styles: [], ...getPos('MC-R') },
      { position: 'MDD', styles: [], ...getPos('MDD') },
      { position: 'EXI', styles: [], ...getPos('EXI') },
      { position: 'DC', styles: [], top: 15, left: 50 },
      { position: 'EXD', styles: [], ...getPos('EXD') },
    ],
  },
  {
    name: '5-3-2',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'LI', styles: [], top: 70, left: 10 }, // Wing-back
      { position: 'DFC', styles: [], top: 78, left: 35 }, // Left DFC
      { position: 'DFC', styles: [], top: 80, left: 50 }, // Center DFC
      { position: 'DFC', styles: [], top: 78, left: 65 }, // Right DFC
      { position: 'LD', styles: [], top: 70, left: 90 }, // Wing-back
      { position: 'MC', styles: [], top: 50, left: 25 }, // Left MC
      { position: 'MCD', styles: [], ...getPos('MCD') },
      { position: 'MC', styles: [], top: 50, left: 75 }, // Right MC
      { position: 'DC', styles: [], ...getPos('DC-L') },
      { position: 'DC', styles: [], ...getPos('DC-R') },
    ],
  },
  {
    name: 'Custom',
    slots: [
      { position: 'PT', styles: [], top: 90, left: 50 },
      { position: 'DFC', styles: [], top: 75, left: 20 },
      { position: 'DFC', styles: [], top: 75, left: 50 },
      { position: 'DFC', styles: [], top: 75, left: 80 },
      { position: 'MC', styles: [], top: 50, left: 20 },
      { position: 'MC', styles: [], top: 50, left: 50 },
      { position: 'MC', styles: [], top: 50, left: 80 },
      { position: 'DC', styles: [], top: 25, left: 20 },
      { position: 'DC', styles: [], top: 25, left: 50 },
      { position: 'DC', styles: [], top: 25, left: 80 },
      { position: 'DC', styles: [], top: 10, left: 50 },
    ],
  },
];
