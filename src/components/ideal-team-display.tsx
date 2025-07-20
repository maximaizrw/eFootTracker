
"use client";

import type { IdealTeamPlayer, IdealTeamSlot, Position } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatAverage, cn } from '@/lib/utils';
import { Users, Shirt, ArrowRight } from 'lucide-react';
import { getCardStyle } from '@/lib/card-styles';
import { PositionIcon } from './position-icon';

type IdealTeamDisplayProps = {
  teamSlots: IdealTeamSlot[];
};

const PlayerDisplayCard = ({ player, isSubstitute = false }: { player: IdealTeamPlayer | null, isSubstitute?: boolean }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    const position = player?.position;
    return (
      <div className={cn(
        "flex-1 min-w-[150px] max-w-[200px] h-32 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 text-center p-2",
        isSubstitute && "h-28 min-w-[120px] max-w-[150px]"
      )}>
        <Shirt className={cn("text-white/40 mb-2", isSubstitute ? "w-6 h-6" : "w-8 h-8")} />
        <p className={cn("font-semibold text-white/70", isSubstitute ? "text-xs" : "text-sm")}>{position}</p>
        <p className="text-xs text-white/50 mt-1">Vacante</p>
      </div>
    );
  }

  const cardStyleInfo = getCardStyle(player.card.name);
  const rowStyle = cardStyleInfo
    ? ({ '--card-color': `hsl(var(--tw-${cardStyleInfo.tailwindClass}))` } as React.CSSProperties)
    : {};
  const specialTextClasses = cardStyleInfo ? `text-[--card-color]` : "text-primary";
  const scoreGlowStyle = cardStyleInfo
    ? { textShadow: `0 0 8px var(--card-color)` }
    : { textShadow: '0 0 8px hsl(var(--primary))' };

  return (
    <div 
      className={cn(
        "flex-1 min-w-[150px] max-w-[200px] bg-card/60 border border-white/10 rounded-lg p-3 flex flex-col items-center text-center transition-all duration-300 hover:border-white/30 hover:bg-card",
        cardStyleInfo && "bg-[--card-color]/10 border-[--card-color]/30 hover:border-[--card-color]/70",
        isSubstitute && "min-w-[120px] max-w-[150px] p-2"
      )}
      style={rowStyle}
    >
      <div className={cn("relative mb-2", isSubstitute ? "w-12 h-12" : "w-16 h-16")}>
        {player.card.imageUrl ? (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes={isSubstitute ? "48px" : "64px"}
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40 rounded-full">
            <Users className={cn("text-muted-foreground/60", isSubstitute ? "w-6 h-6" : "w-8 h-8")} />
          </div>
        )}
        <div 
          className={cn(
            "absolute -top-1 -right-1 font-bold text-white rounded-full bg-background flex items-center justify-center border-2",
            isSubstitute ? "text-xs h-6 w-6" : "text-sm h-7 w-7",
            cardStyleInfo ? "border-[--card-color]" : "border-primary"
          )}
          style={scoreGlowStyle}
        >
          {formatAverage(player.average)}
        </div>
      </div>
       <p className={cn("font-semibold text-foreground truncate w-full", isSubstitute ? "text-sm" : "text-base")} title={player.player.name}>
        {player.player.name}
      </p>
      <p className={cn("truncate w-full", isSubstitute ? "text-xs" : "text-sm", cardStyleInfo ? specialTextClasses : 'text-muted-foreground')} title={player.card.name}>
        {player.card.name}
      </p>
    </div>
  );
};


const TeamSlotRow = ({ slot, index }: { slot: IdealTeamSlot; index: number }) => {
  const position = slot.starter?.position || 'N/A';
  
  return (
    <div className="flex items-stretch justify-center gap-3 md:gap-6 p-4 bg-card/40 rounded-lg border border-white/10">
      {/* Posición y Titular */}
      <div className="flex-1 flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-16 text-center">
            <Badge variant="secondary" className="mb-2 bg-white/5 border-white/10 text-xs">
                {index + 1}
            </Badge>
            <PositionIcon position={position} className="h-6 w-6 text-primary" />
            <p className="font-bold text-lg mt-1">{position}</p>
        </div>
        <PlayerDisplayCard player={slot.starter} />
      </div>

      {/* Separador */}
      <div className="flex items-center justify-center px-2">
        <ArrowRight className="h-6 w-6 text-muted-foreground/50" />
      </div>

      {/* Suplente */}
      <div className="flex-1 flex justify-start items-center">
         <PlayerDisplayCard player={slot.substitute} isSubstitute />
      </div>
    </div>
  );
};


export function IdealTeamDisplay({ teamSlots }: IdealTeamDisplayProps) {
  if (teamSlots.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground p-8 bg-card/60 rounded-lg border border-dashed border-white/10">
        Configura una formación y haz clic en "Generar 11 Ideal" para ver los resultados aquí.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
       <div className='flex justify-between items-center text-center font-semibold text-sm text-foreground mb-2 px-4'>
        <p className="flex-1 text-center">Titular</p>
        <div className="w-16 md:w-24" /> 
        <p className="flex-1 text-center">Suplente</p>
      </div>

      <div className="space-y-3">
        {teamSlots.map((slot, index) => (
          <TeamSlotRow key={`${slot.starter?.player.id}-${index}`} slot={slot} index={index} />
        ))}
      </div>
    </div>
  );
}
