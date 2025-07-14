"use client";

import { PositionIcon } from '@/components/position-icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { positions, type Position, type Formation } from '@/lib/types';

type IdealTeamSetupProps = {
  formation: Formation;
  onFormationChange: (position: Position, value: string) => void;
};

export function IdealTeamSetup({ formation, onFormationChange }: IdealTeamSetupProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 border border-dashed border-white/10 rounded-lg">
      {positions.map(pos => (
        <div key={pos} className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <PositionIcon position={pos} className="h-4 w-4 text-primary"/>
            {pos}
          </label>
          <Select
            value={(formation[pos] ?? 0).toString()}
            onValueChange={(value) => onFormationChange(pos, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map(num => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
