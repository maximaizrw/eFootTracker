
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

const PlayerToken = ({
  slot,
  onSlotChange,
  style,
  isSelected,
  onClick
}: {
  slot: FormationSlot;
  onSlotChange: (newSlot: FormationSlot) => void;
  style: React.CSSProperties;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const availableStyles = getAvailableStylesForPosition(slot.position, false);

  const handleStyleToggle = (style: PlayerStyle) => {
    const currentValues = slot.styles || [];
    const isSelected = currentValues.includes(style);
    const newValues = isSelected
      ? currentValues.filter((s) => s !== style)
      : [...currentValues, style];
    onSlotChange({ ...slot, styles: newValues });
  };
  
  return (
    <div
        className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
            "bg-primary/20 border-2 border-primary/80 text-primary-foreground",
            "hover:bg-primary/40 hover:scale-105",
             isSelected && "ring-4 ring-accent scale-110"
        )}
        style={style}
        onClick={onClick}
    >
      <span className="font-bold text-lg text-white">{slot.position}</span>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            className="absolute bottom-0 right-0 p-0.5 rounded-full bg-background/80 hover:bg-accent"
            onClick={(e) => { e.stopPropagation(); setIsPopoverOpen(true); }}
            aria-label="Configurar posición"
          >
            <Settings className="h-4 w-4 text-white/70" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Posición</label>
                <Select
                  value={slot.position}
                  onValueChange={(newPos) => onSlotChange({ ...slot, position: newPos as Position, styles: [] })}
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
                                          onSelect={() => handleStyleToggle(style)}
                                          onClick={() => handleStyleToggle(style)}
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
    </div>
  );
};


export function VisualFormationEditor({ value, onChange }: VisualFormationEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [movingTokenIndex, setMovingTokenIndex] = React.useState<number | null>(null);

  const handleFieldClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (movingTokenIndex === null) return;
    
    const fieldRect = editorRef.current?.getBoundingClientRect();
    if (!fieldRect) return;

    const x = e.clientX - fieldRect.left;
    const y = e.clientY - fieldRect.top;

    const leftPercent = (x / fieldRect.width) * 100;
    const topPercent = (y / fieldRect.height) * 100;

    const newSlots = [...value];
    newSlots[movingTokenIndex].left = leftPercent;
    newSlots[movingTokenIndex].top = topPercent;

    onChange(newSlots);
    setMovingTokenIndex(null);
  };
  
  const handleTokenClick = (index: number) => {
    if (movingTokenIndex === index) {
      setMovingTokenIndex(null); // Cancel move
    } else {
      setMovingTokenIndex(index);
    }
  };

  const handleSlotChange = (index: number, newSlot: FormationSlot) => {
    const newSlots = [...value];
    newSlots[index] = newSlot;
    onChange(newSlots);
  };
  
  return (
    <div 
        ref={editorRef}
        onClick={handleFieldClick}
        className={cn(
            "relative w-full aspect-video bg-field-gradient rounded-lg border border-white/10 overflow-hidden",
            movingTokenIndex !== null && "cursor-move"
        )}
    >
      {/* Field markings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/20 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[calc(100%-80px)] border-l-2 border-r-2 border-white/20 pointer-events-none">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-40 border-b-2 border-l-2 border-r-2 border-white/20 rounded-b-xl pointer-events-none" />
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-20 w-40 border-t-2 border-l-2 border-r-2 border-white/20 rounded-t-xl pointer-events-none" />
      </div>


      {value.map((slot, index) => {
        const style: React.CSSProperties = {
            top: `${slot.top || 50}%`,
            left: `${slot.left || 50}%`,
        };
        return (
          <PlayerToken
            key={index}
            slot={slot}
            onSlotChange={(newSlot) => handleSlotChange(index, newSlot)}
            style={style}
            isSelected={movingTokenIndex === index}
            onClick={(e) => { e.stopPropagation(); handleTokenClick(index); }}
          />
        );
      })}
    </div>
  );
}
