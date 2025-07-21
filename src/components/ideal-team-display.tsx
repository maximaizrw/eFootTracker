
"use client";

import type { IdealTeamPlayer, IdealTeamSlot } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatAverage, cn } from '@/lib/utils';
import { Users, Shirt, ArrowRight } from 'lucide-react';
import { getCardStyle } from '@/lib/card-styles';

type IdealTeamDisplayProps = {
  teamSlots: IdealTeamSlot[];
};

const PlayerDisplayCard = ({ player }: { player: IdealTeamPlayer | null }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    return (
      <div className="flex-1 flex items-center gap-3 p-2 rounded-lg bg-black/20 border-2 border-dashed border-white/30">
        <div className="w-12 h-12 flex items-center justify-center bg-muted/20 rounded-lg">
          <Shirt className="w-8 h-8 text-white/40" />
        </div>
        <div>
          <p className="font-semibold text-muted-foreground">Vacante</p>
        </div>
      </div>
    );
  }

  const cardStyleInfo = getCardStyle(player.card.name);
  const cardColorStyle = cardStyleInfo
    ? ({ '--card-color': `hsl(var(--tw-${cardStyleInfo.tailwindClass}))` } as React.CSSProperties)
    : {};
  const specialTextClasses = cardStyleInfo ? `text-[--card-color]` : "text-primary";
  const scoreGlowStyle = cardStyleInfo
    ? { textShadow: `0 0 8px var(--card-color)` }
    : { textShadow: '0 0 8px hsl(var(--primary))' };

  return (
    <div 
        className={cn(
            "flex-1 flex items-center gap-3 p-2 rounded-lg bg-card/60 border border-white/10",
            cardStyleInfo && "bg-[--card-color]/10 border-[--card-color]/40"
        )}
        style={cardColorStyle}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        {player.card.imageUrl ? (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes="48px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40 rounded-full">
            <Users className="w-6 h-6 text-muted-foreground/60" />
          </div>
        )}
         <div 
            className={cn(
                "absolute -top-1 -right-1 font-bold text-white rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border-2 text-xs h-6 w-6",
                cardStyleInfo ? "border-[--card-color]" : "border-primary"
            )}
            style={scoreGlowStyle}
        >
           {formatAverage(player.average)}
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold text-foreground truncate" title={player.player.name}>
          {player.player.name}
        </p>
        <p className={cn("text-xs truncate", specialTextClasses)} title={player.card.name}>
          {player.card.name}
        </p>
        <Badge variant="secondary" className="mt-1 bg-white/5 text-white/70 text-xs">{player.card.style}</Badge>
      </div>
    </div>
  );
};

const IdealTeamRow = ({ slot }: { slot: IdealTeamSlot }) => {
    const position = slot.starter?.position || slot.substitute?.position || "N/A";

    return (
        <div className="flex items-center gap-4">
            <div className="w-16 text-center font-bold text-lg text-muted-foreground">{position}</div>
            <PlayerDisplayCard player={slot.starter} />
            <ArrowRight className="text-muted-foreground flex-shrink-0" />
            <PlayerDisplayCard player={slot.substitute} />
        </div>
    )
}

export function IdealTeamDisplay({ teamSlots }: IdealTeamDisplayProps) {
  if (teamSlots.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground p-8 bg-card/60 rounded-lg border border-dashed border-white/10">
        Configura una formación y haz clic en "Generar 11 Ideal" para ver los resultados aquí.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="space-y-3 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 px-4">
             <div className="w-16"></div>
             <div className="flex-1 font-semibold text-muted-foreground text-center">Titular</div>
             <div className="w-6"></div>
             <div className="flex-1 font-semibold text-muted-foreground text-center">Suplente</div>
        </div>
        {teamSlots.map((slot, index) => (
          <IdealTeamRow key={slot.starter?.player.id || `slot-${index}`} slot={slot} />
        ))}
      </div>
    </div>
  );
}
