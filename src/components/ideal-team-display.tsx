"use client";

import type { IdealTeamPlayer, Position } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatAverage, cn } from '@/lib/utils';
import { Users, Shield, Target, HandMetal, Shirt } from 'lucide-react';
import { getCardStyle } from '@/lib/card-styles';
import { PositionIcon } from './position-icon';

type IdealTeamDisplayProps = {
  team: (IdealTeamPlayer | null)[];
};

const PlayerDisplayCard = ({ player }: { player: IdealTeamPlayer | null }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    const position = player?.position;
    return (
      <div className="flex-1 min-w-[150px] max-w-[200px] h-32 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 text-center p-2">
        <Shirt className="w-8 h-8 text-white/40 mb-2" />
        <p className="text-sm font-semibold text-white/70">{position}</p>
        <p className="text-xs text-white/50 mt-1">Vacante</p>
      </div>
    );
  }

  const cardStyle = getCardStyle(player.card.name);
  const rowStyle = cardStyle
    ? ({ '--card-color': `hsl(var(--tw-${cardStyle.tailwindClass}))` } as React.CSSProperties)
    : {};
  const specialTextClasses = cardStyle ? `text-[--card-color]` : "text-primary";
  const scoreGlowStyle = cardStyle
    ? { textShadow: `0 0 8px var(--card-color)` }
    : { textShadow: '0 0 8px hsl(var(--primary))' };

  return (
    <div 
      className={cn(
        "flex-1 min-w-[150px] max-w-[200px] bg-card/60 border border-white/10 rounded-lg p-3 flex flex-col items-center text-center transition-all duration-300 hover:border-white/30 hover:bg-card",
        cardStyle && "bg-[--card-color]/10 border-[--card-color]/30 hover:border-[--card-color]/70"
      )}
      style={rowStyle}
    >
      <div className="relative w-16 h-16 mb-2">
        {player.card.imageUrl ? (
          <Image
            src={player.card.imageUrl}
            alt={player.card.name}
            fill
            sizes="64px"
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40 rounded-full">
            <Users className="w-8 h-8 text-muted-foreground/60" />
          </div>
        )}
        <div 
          className={cn("absolute -top-1 -right-1 text-sm font-bold text-white rounded-full bg-background h-7 w-7 flex items-center justify-center border-2", cardStyle ? "border-[--card-color]" : "border-primary")}
          style={scoreGlowStyle}
        >
          {formatAverage(player.average)}
        </div>
      </div>
      <Badge variant="secondary" className="mb-2 bg-white/5 border-white/10">
        <PositionIcon position={player.position} className="h-4 w-4 mr-1.5"/>
        {player.position}
      </Badge>
      <p className="font-semibold text-sm text-foreground truncate w-full" title={player.player.name}>
        {player.player.name}
      </p>
      <p className={cn("text-xs truncate w-full", cardStyle ? specialTextClasses : 'text-muted-foreground')} title={player.card.name}>
        {player.card.name}
      </p>
    </div>
  );
};

const renderLine = (
    title: string, 
    icon: React.ReactNode,
    players: (IdealTeamPlayer | null)[], 
    positions: Position[]
) => {
    const filteredPlayers = positions.flatMap(pos => players.filter(p => p?.position === pos));
    if (filteredPlayers.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                {icon}
                {title}
                <span className="text-sm font-normal">({filteredPlayers.length})</span>
            </h3>
            <div className="flex flex-wrap items-stretch justify-start gap-3">
                {filteredPlayers.map((p, i) => (
                    <PlayerDisplayCard key={`${p?.player.id}-${p?.card.id}-${i}`} player={p} />
                ))}
            </div>
        </div>
    );
};

export function IdealTeamDisplay({ team }: IdealTeamDisplayProps) {
  if (team.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground p-8 bg-card/60 rounded-lg border border-dashed border-white/10">
        Configura una formación y haz clic en "Generar 11 Ideal" para ver los resultados aquí.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {renderLine("Delanteros", <Target className="h-5 w-5" />, team, ['DC', 'SD', 'EXI', 'EXD'])}
      {renderLine("Mediocampistas", <Users className="h-5 w-5" />, team, ['MO', 'MC', 'MDI', 'MDD', 'MCD'])}
      {renderLine("Defensas", <Shield className="h-5 w-5" />, team, ['LI', 'LD', 'DFC'])}
      {renderLine("Portero", <HandMetal className="h-5 w-5" />, team, ['PT'])}
    </div>
  );
}
