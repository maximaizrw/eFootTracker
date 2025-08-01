
import type { FormationSlot } from './types';

export type FormationPreset = {
  name: string;
  slots: FormationSlot[];
};

export const formationPresets: FormationPreset[] = [
  {
    name: '4-3-3',
    slots: [
      { position: 'PT', styles: [] },
      { position: 'LI', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'LD', styles: [] },
      { position: 'MCD', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'EXI', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'EXD', styles: [] },
    ],
  },
  {
    name: '4-4-2',
    slots: [
      { position: 'PT', styles: [] },
      { position: 'LI', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'LD', styles: [] },
      { position: 'MDI', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MDD', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'DC', styles: [] },
    ],
  },
    {
    name: '4-2-3-1',
    slots: [
      { position: 'PT', styles: [] },
      { position: 'LI', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'LD', styles: [] },
      { position: 'MCD', styles: [] },
      { position: 'MCD', styles: [] },
      { position: 'EXI', styles: [] },
      { position: 'MO', styles: [] },
      { position: 'EXD', styles: [] },
      { position: 'DC', styles: [] },
    ],
  },
  {
    name: '3-4-3',
    slots: [
      { position: 'PT', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'MDI', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MDD', styles: [] },
      { position: 'EXI', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'EXD', styles: [] },
    ],
  },
  {
    name: '5-3-2',
    slots: [
      { position: 'PT', styles: [] },
      { position: 'LI', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'LD', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MCD', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'DC', styles: [] },
    ],
  },
  {
    name: 'Custom',
    slots: [
      { position: 'PT', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'DFC', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'MC', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'DC', styles: [] },
      { position: 'DC', styles: [] },
    ],
  },
];
