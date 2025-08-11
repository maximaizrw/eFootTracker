
import type { FormationSlot } from './types';

export type FormationPreset = {
  name: string;
  slots: FormationSlot[];
};

// Field coordinate system:
// top: 0% is attacking goal, 100% is defending goal
// left: 0% is right side of field, 100% is left side of field (from player's perspective)
const positionGrid: { [key: string]: { top: number; left: number } } = {
  'PT': { top: 90, left: 50 },
  
  'LD': { top: 75, left: 15 },
  'DFC-L': { top: 78, left: 65 }, // Left Center Back
  'DFC-R': { top: 78, left: 35 }, // Right Center Back
  'LI': { top: 75, left: 85 },
  
  'MDD': { top: 50, left: 20 },
  'MCD': { top: 60, left: 50 },
  'MC-L': { top: 50, left: 65 }, // Left Center Mid
  'MC-R': { top: 50, left: 35 }, // Right Center Mid
  'MDI': { top: 50, left: 80 },
  
  'EXD': { top: 25, left: 15 },
  'MO': { top: 35, left: 50 },
  'SD': { top: 28, left: 50 },
  'EXI': { top: 25, left: 85 },
  
  'DC-L': { top: 15, left: 60 }, // Left Striker
  'DC-R': { top: 15, left: 40 }, // Right Striker
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
      { position: 'MC', styles: [], top: 50, left: 70 }, // Left MC
      { position: 'MC', styles: [], top: 50, left: 30 }, // Right MC
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
      { position: 'MCD', styles: [], top: 60, left: 65 }, // Left MCD
      { position: 'MCD', styles: [], top: 60, left: 35 }, // Right MCD
      { position: 'MDI', styles: [], top: 45, left: 85 },
      { position: 'MO', styles: [], ...getPos('MO') },
      { position: 'MDD', styles: [], top: 45, left: 15 },
      { position: 'DC', styles: [], top: 15, left: 50 },
    ],
  },
  {
    name: '3-4-3',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'DFC', styles: [], top: 78, left: 80 }, // Left DFC
      { position: 'DFC', styles: [], top: 80, left: 50 }, // Center DFC
      { position: 'DFC', styles: [], top: 78, left: 20 }, // Right DFC
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
      { position: 'LI', styles: [], top: 70, left: 90 }, // Wing-back
      { position: 'DFC', styles: [], top: 78, left: 65 }, // Left DFC
      { position: 'DFC', styles: [], top: 80, left: 50 }, // Center DFC
      { position: 'DFC', styles: [], top: 78, left: 35 }, // Right DFC
      { position: 'LD', styles: [], top: 70, left: 10 }, // Wing-back
      { position: 'MC', styles: [], top: 50, left: 75 }, // Left MC
      { position: 'MCD', styles: [], ...getPos('MCD') },
      { position: 'MC', styles: [], top: 50, left: 25 }, // Right MC
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
