
"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Settings } from "lucide-react";
import type { FormationSlot, Position, PlayerStyle } from "@/lib/types";
import { positions } from "@/lib/types";
import { cn, getAvailableStylesForPosition } from "@/lib/utils";

type VisualFormationEditorProps = {
  value: FormationSlot[];
  onChange: (value: FormationSlot[]) => void;
};

const positionGrid: { [key in Position]?: { row: number; col: number } } = {
  PT: { row: 9, col: 2 },
  
  LD: { row: 7, col: 0 },
  DFC: { row: 7, col: 2 },
  LI: { row: 7, col: 4 },
  
  MDD: { row: 5, col: 0 },
  MCD: { row: 5, col: 2 },
  MC: { row: 4, col: 2 },
  MDI: { row: 5, col: 4 },
  
  EXD: { row: 2, col: 0 },
  MO: { row: 3, col: 2 },
  SD: { row: 2, col: 2 },
  EXI: { row: 2, col: 4 },
  
  DC: { row: 1, col: 2 },
};

const PlayerToken = ({
  slot,
  onSlotChange,
}: {
  slot: FormationSlot;
  onSlotChange: (newSlot: FormationSlot) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const availableStyles = getAvailableStylesForPosition(slot.position, false);

  const handleStyleSelect = (style: PlayerStyle) => {
    const currentValues = slot.styles || [];
    const isSelected = currentValues.includes(style);
    const newValues = isSelected
      ? currentValues.filter((s) => s !== style)
      : [...currentValues, style];
    onSlotChange({ ...slot, styles: newValues });
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-300",
            "bg-primary/20 border-2 border-primary/80 text-primary-foreground",
            "hover:bg-primary/40 hover:scale-105"
          )}
          style={{
             top: `${positionGrid[slot.position]?.row * 10 + 5}%`,
             left: `${positionGrid[slot.position]?.col * 20 + 10}%`,
          }}
        >
          <span className="font-bold text-lg text-white">{slot.position}</span>
          <Settings className="h-4 w-4 text-white/70" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Posición</label>
              <Select
                value={slot.position}
                onValueChange={(newPos) => onSlotChange({ position: newPos as Position, styles: [] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
                 <label className="text-sm font-medium mb-2 block">Estilos de Juego</label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-auto"
                        >
                            <div className="flex gap-1 flex-wrap">
                                {slot.styles && slot.styles.length > 0 ? (
                                    slot.styles.map((style) => (
                                        <Badge variant="secondary" key={style} className="mr-1">
                                            {style}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground">Cualquiera</span>
                                )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Buscar estilo..." />
                            <CommandList>
                                <CommandEmpty>No se encontró el estilo.</CommandEmpty>
                                {availableStyles.map((style) => (
                                    <CommandItem
                                        key={style}
                                        onSelect={() => handleStyleSelect(style)}
                                        onClick={() => handleStyleSelect(style)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                slot.styles?.includes(style) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {style}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};


export function VisualFormationEditor({ value, onChange }: VisualFormationEditorProps) {
  const handleSlotChange = (index: number, newSlot: FormationSlot) => {
    const newSlots = [...value];
    newSlots[index] = newSlot;
    onChange(newSlots);
  };
  
  // Create a map to track positions used to handle duplicates (like multiple DFCs)
  const positionCount = new Map<Position, number>();

  return (
    <div className="relative w-full aspect-video bg-field-gradient rounded-lg border border-white/10 overflow-hidden">
      {/* Field markings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full" />
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[calc(100%-80px)] border-l-2 border-r-2 border-white/20">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-40 border-b-2 border-l-2 border-r-2 border-white/20 rounded-b-xl" />
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-20 w-40 border-t-2 border-l-2 border-r-2 border-white/20 rounded-t-xl" />
      </div>


      {value.map((slot, index) => {
        const count = positionCount.get(slot.position) || 0;
        positionCount.set(slot.position, count + 1);

        // Adjust column for duplicate positions to avoid overlap
        let gridPos = positionGrid[slot.position] || { row: 5, col: 2 };
        if (count > 0) {
            // Simple logic to spread out duplicate positions horizontally
            const offset = (count % 2 === 0 ? -1 : 1) * Math.ceil(count / 2) * 1;
            gridPos = { ...gridPos, col: gridPos.col + offset };
        }

        return (
          <PlayerToken
            key={index}
            slot={{...slot}}
            onSlotChange={(newSlot) => handleSlotChange(index, newSlot)}
          />
        );
      })}
    </div>
  );
}
