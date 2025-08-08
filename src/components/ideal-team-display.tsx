
"use client";

import type { IdealTeamPlayer, IdealTeamSlot, FormationStats } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatAverage, cn } from '@/lib/utils';
import { Users, Shirt, X } from 'lucide-react';
import { getCardStyle } from '@/lib/card-styles';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type IdealTeamDisplayProps = {
  teamSlots: IdealTeamSlot[];
  formation?: FormationStats;
  onDiscardPlayer: (cardId: string) => void;
};

const PlayerToken = ({ player, style, onDiscard }: { player: IdealTeamPlayer | null, style: React.CSSProperties, onDiscard: (cardId: string) => void }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    return (
      <div 
        className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-28 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border-2 border-dashed border-white/30 bg-black/20"
        style={style}
      >
        <Shirt className="w-8 h-8 text-white/40" />
      </div>
    );
  }

  const cardStyleInfo = getCardStyle(player.card.name);
  const cardColorStyle = cardStyleInfo
    ? ({ '--card-color': `hsl(var(--tw-${cardStyleInfo.tailwindClass}))` } as React.CSSProperties)
    : {};
  
  const scoreGlowStyle = cardStyleInfo
    ? { textShadow: `0 0 8px var(--card-color)` }
    : { textShadow: '0 0 8px hsl(var(--primary))' };

  return (
    <div 
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 w-24 h-28 rounded-lg flex flex-col items-center justify-between text-center transition-all duration-200 p-1 group",
        "bg-card/80 backdrop-blur-sm border",
        cardStyleInfo ? "bg-[--card-color]/10 border-[--card-color]/40" : "border-white/10"
      )}
      style={{...style, ...cardColorStyle}}
    >
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        onClick={() => onDiscard(player.card.id)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>Descartar jugador</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <div className="relative w-14 h-14 flex-shrink-0 mt-1">
        {player.card.imageUrl ? (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes="56px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40 rounded-full">
            <Users className="w-8 h-8 text-muted-foreground/60" />
          </div>
        )}
        <div 
            className={cn(
                "absolute -top-1.5 -left-1.5 font-bold text-white rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border-2 text-sm h-7 w-7",
                cardStyleInfo ? "border-[--card-color]" : "border-primary"
            )}
            style={scoreGlowStyle}
        >
           {formatAverage(player.average)}
        </div>
      </div>
      <div className="w-full mb-1">
        <p className="font-semibold text-xs text-foreground truncate w-full" title={player.player.name}>
          {player.player.name}
        </p>
        <p className="font-bold text-lg leading-tight -mt-0.5">{player.position}</p>
      </div>
    </div>
  );
};

const SubstitutePlayerRow = ({ player }: { player: IdealTeamPlayer | null }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border-2 border-dashed border-white/30 h-16">
        <div className="w-10 h-10 flex items-center justify-center bg-muted/20 rounded-lg">
          <Shirt className="w-6 h-6 text-white/40" />
        </div>
        <div className="font-semibold text-muted-foreground">Vacante</div>
      </div>
    );
  }

  const cardStyleInfo = getCardStyle(player.card.name);
  const cardColorStyle = cardStyleInfo
    ? ({ '--card-color': `hsl(var(--tw-${cardStyleInfo.tailwindClass}))` } as React.CSSProperties)
    : {};
  const specialTextClasses = cardStyleInfo ? `text-[--card-color]` : "text-primary";

  return (
    <div 
        className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-card/60 border border-white/10 h-16",
            cardStyleInfo && "bg-[--card-color]/10 border-[--card-color]/40"
        )}
        style={cardColorStyle}
    >
      <div className="w-16 font-bold text-lg text-center text-muted-foreground">{player.position}</div>
      <div className="relative w-10 h-10 flex-shrink-0">
        {player.card.imageUrl && (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes="40px"
            className="object-contain"
          />
        )}
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold text-foreground truncate" title={player.player.name}>
          {player.player.name}
        </p>
        <p className={cn("text-xs truncate", specialTextClasses)} title={player.card.name}>
          {player.card.name}
        </p>
      </div>
      <Badge variant="secondary" className="bg-white/5 text-white/70 text-xs">{player.card.style}</Badge>
      <div className="font-bold text-lg w-12 text-center">{formatAverage(player.average)}</div>
    </div>
  );
};

export function IdealTeamDisplay({ teamSlots, formation, onDiscardPlayer }: IdealTeamDisplayProps) {
  if (teamSlots.length === 0 || !formation) {
    return (
      <div className="mt-8 text-center text-muted-foreground p-8 bg-card/60 rounded-lg border border-dashed border-white/10">
        Configura una formación y haz clic en "Generar 11 Ideal" para ver los resultados aquí.
      </div>
    );
  }
  
  const substitutes = teamSlots.map(slot => slot.substitute).filter(sub => sub !== null);

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div 
            className="relative w-full aspect-video bg-field-gradient rounded-lg border border-white/10 overflow-hidden"
        >
          {/* Field markings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-48 md:h-48 border-2 border-white/20 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-px bg-white/20 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-[calc(100%-40px)] md:w-[calc(100%-80px)] border-l-2 border-r-2 border-white/20 pointer-events-none">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 h-14 w-28 md:h-20 md:w-40 border-b-2 border-l-2 border-r-2 border-white/20 rounded-b-lg md:rounded-b-xl pointer-events-none" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-14 w-28 md:h-20 md:w-40 border-t-2 border-l-2 border-r-2 border-white/20 rounded-t-lg md:rounded-t-xl pointer-events-none" />
          </div>

          {teamSlots.map((slot, index) => {
             const formationSlot = formation.slots[index];
             const style: React.CSSProperties = {
                top: `${formationSlot?.top || 50}%`,
                left: `${formationSlot?.left || 50}%`,
             };
             return <PlayerToken key={slot.starter?.card.id || `starter-${index}`} player={slot.starter} style={style} onDiscard={onDiscardPlayer} />;
          })}
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <h3 className="text-xl font-semibold mb-4 text-center">Banquillo de Suplentes</h3>
        <div className="space-y-2">
          {substitutes.map((sub, index) => (
             <SubstitutePlayerRow key={sub?.card.id || `sub-${index}`} player={sub} />
          ))}
        </div>
      </div>
    </div>
  );
}
