
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FormationStats } from '@/lib/types';

type IdealTeamSetupProps = {
  formations: FormationStats[];
  selectedFormationId?: string;
  onFormationChange: (id: string) => void;
};

export function IdealTeamSetup({ formations, selectedFormationId, onFormationChange }: IdealTeamSetupProps) {
  if (formations.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4 border border-dashed rounded-lg">
        Aún no has creado ninguna formación. Ve a la pestaña "Formaciones" para empezar.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Selecciona tu Plantilla Táctica
      </label>
      <Select
        value={selectedFormationId}
        onValueChange={onFormationChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Elige una formación..." />
        </SelectTrigger>
        <SelectContent>
          {formations.map(f => (
            <SelectItem key={f.id} value={f.id}>
              {f.name} {f.creator && ` - ${f.creator}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
