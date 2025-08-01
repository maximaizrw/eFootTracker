
import type { FormationSlot } from './types';

export type FormationPreset = {
  name: string;
  slots: FormationSlot[];
};

const positionGrid: { [key: string]: { top: number; left: number } } = {
  'PT': { top: 90, left: 50 },
  
  'LD': { top: 75, left: 15 },
  'DFC-0': { top: 78, left: 35 },
  'DFC-1': { top: 78, left: 65 },
  'LI': { top: 75, left: 85 },
  
  'MDD': { top: 50, left: 15 },
  'MCD': { top: 60, left: 50 },
  'MC-0': { top: 50, left: 35 },
  'MC-1': { top: 50, left: 65 },
  'MDI': { top: 50, left: 85 },
  
  'EXD': { top: 25, left: 15 },
  'MO': { top: 35, left: 50 },
  'SD': { top: 28, left: 50 },
  'EXI': { top: 25, left: 85 },
  
  'DC-0': { top: 15, left: 35 },
  'DC-1': { top: 15, left: 65 },
};

const getPos = (key: string) => positionGrid[key] || { top: 50, left: 50 };

export const formationPresets: FormationPreset[] = [
  {
    name: '4-3-3',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'LI', styles: [], ...getPos('LI') },
      { position: 'DFC', styles: [], ...getPos('DFC-0') },
      { position: 'DFC', styles: [], ...getPos('DFC-1') },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MCD', styles: [], ...getPos('MCD') },
      { position: 'MC', styles: [], top: 50, left: 30 },
      { position: 'MC', styles: [], top: 50, left: 70 },
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
      { position: 'DFC', styles: [], ...getPos('DFC-0') },
      { position: 'DFC', styles: [], ...getPos('DFC-1') },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MDI', styles: [], ...getPos('MDI') },
      { position: 'MC', styles: [], ...getPos('MC-0') },
      { position: 'MC', styles: [], ...getPos('MC-1') },
      { position: 'MDD', styles: [], ...getPos('MDD') },
      { position: 'DC', styles: [], ...getPos('DC-0') },
      { position: 'DC', styles: [], ...getPos('DC-1') },
    ],
  },
    {
    name: '4-2-3-1',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'LI', styles: [], ...getPos('LI') },
      { position: 'DFC', styles: [], ...getPos('DFC-0') },
      { position: 'DFC', styles: [], ...getPos('DFC-1') },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MCD', styles: [], top: 60, left: 35 },
      { position: 'MCD', styles: [], top: 60, left: 65 },
      { position: 'MDI', styles: [], ...getPos('MDI') },
      { position: 'MO', styles: [], ...getPos('MO') },
      { position: 'MDD', styles: [], ...getPos('MDD') },
      { position: 'DC', styles: [], top: 15, left: 50 },
    ],
  },
  {
    name: '3-4-3',
    slots: [
      { position: 'PT', styles: [], ...getPos('PT') },
      { position: 'DFC', styles: [], top: 78, left: 20 },
      { position: 'DFC', styles: [], ...getPos('DFC-0') },
      { position: 'DFC', styles: [], top: 78, left: 80 },
      { position: 'MDI', styles: [], ...getPos('MDI') },
      { position: 'MC', styles: [], ...getPos('MC-0') },
      { position: 'MC', styles: [], ...getPos('MC-1') },
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
      { position: 'LI', styles: [], ...getPos('LI') },
      { position: 'DFC', styles: [], top: 78, left: 20 },
      { position: 'DFC', styles: [], ...getPos('DFC-0') },
      { position: 'DFC', styles: [], top: 78, left: 80 },
      { position: 'LD', styles: [], ...getPos('LD') },
      { position: 'MC', styles: [], top: 50, left: 25 },
      { position: 'MCD', styles: [], ...getPos('MCD') },
      { position: 'MC', styles: [], top: 50, left: 75 },
      { position: 'DC', styles: [], ...getPos('DC-0') },
      { position: 'DC', styles: [], ...getPos('DC-1') },
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
