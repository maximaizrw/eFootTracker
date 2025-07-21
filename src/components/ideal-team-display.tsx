
"use client";

import type { IdealTeamPlayer, IdealTeamSlot } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatAverage, cn, getPositionGroup } from '@/lib/utils';
import { Users, Shirt } from 'lucide-react';
import { getCardStyle } from '@/lib/card-styles';

type IdealTeamDisplayProps = {
  teamSlots: IdealTeamSlot[];
};


const PlayerChip = ({ player }: { player: IdealTeamPlayer }) => {
  const cardStyleInfo = getCardStyle(player.card.name);
  const chipStyle = cardStyleInfo
    ? ({ '--card-color': `hsl(var(--tw-${cardStyleInfo.tailwindClass}))` } as React.CSSProperties)
    : {};
  const specialTextClasses = cardStyleInfo ? `text-[--card-color]` : "text-primary";
  const scoreGlowStyle = cardStyleInfo
    ? { textShadow: `0 0 8px var(--card-color)` }
    : { textShadow: '0 0 8px hsl(var(--primary))' };

  return (
    <div 
      className={cn(
        "relative w-24 h-28 bg-card/70 backdrop-blur-sm border-2 border-white/20 rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-white/50 hover:bg-card/90",
        cardStyleInfo && "border-[--card-color]/40 hover:border-[--card-color]/80 bg-[--card-color]/10"
      )}
      style={chipStyle}
    >
        <div className="relative w-12 h-12">
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
                    "absolute -top-1 -right-1 font-bold text-white rounded-full bg-background flex items-center justify-center border-2 text-xs h-6 w-6",
                    cardStyleInfo ? "border-[--card-color]" : "border-primary"
                )}
                style={scoreGlowStyle}
            >
            {formatAverage(player.average)}
            </div>
        </div>
        <p className="font-semibold text-foreground truncate w-full text-sm mt-1" title={player.player.name}>
            {player.player.name}
        </p>
        <p className={cn("text-xs truncate w-full", cardStyleInfo ? specialTextClasses : 'text-muted-foreground')} title={player.card.name}>
            {player.card.name}
        </p>
    </div>
  );
};

const EmptyChip = ({ position }: { position: string }) => {
    return (
         <div className="w-24 h-28 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 text-center p-2">
            <Shirt className="w-8 h-8 text-white/40 mb-1" />
            <p className="font-semibold text-sm text-white/70">{position}</p>
        </div>
    );
};


const PlayerRow = ({ player, title }: { player: IdealTeamPlayer | null, title: string }) => {
    if (!player || player.player.id.startsWith('placeholder')) {
        return (
            <div className="flex items-center gap-4 p-2 bg-card/40 rounded-lg">
                <div className="font-semibold text-muted-foreground w-20 text-center">{title}</div>
                 <div className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg border-2 border-dashed border-white/30">
                    <Shirt className="w-6 h-6 text-white/40" />
                </div>
                <p className="text-muted-foreground">Vacante</p>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-4 p-2 bg-card/40 rounded-lg">
            <div className="font-semibold text-muted-foreground w-20 text-center">{title}</div>
            <div className="relative w-12 h-12">
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
            </div>
            <div>
                <p className="font-semibold">{player.player.name}</p>
                <p className="text-sm text-muted-foreground">{player.card.name}</p>
            </div>
            <div className="ml-auto pr-4">
                <Badge variant="secondary" className="bg-white/10 text-white/80">{player.card.style}</Badge>
            </div>
        </div>
    );
};


const getPositionAlignment = (positionGroup: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward') => {
    switch(positionGroup) {
        case 'Goalkeeper': return 'justify-center';
        case 'Defender': return 'justify-around';
        case 'Midfielder': return 'justify-around';
        case 'Forward': return 'justify-around';
        default: return 'justify-around';
    }
}

export function IdealTeamDisplay({ teamSlots }: IdealTeamDisplayProps) {
  if (teamSlots.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground p-8 bg-card/60 rounded-lg border border-dashed border-white/10">
        Configura una formación y haz clic en "Generar 11 Ideal" para ver los resultados aquí.
      </div>
    );
  }

  const starters = teamSlots.map(s => s.starter);
  const substitutes = teamSlots.map(s => s.substitute);
  
  const groupedStarters: { [key: string]: (IdealTeamPlayer | null)[] } = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Forward: []
  };
  
  starters.forEach(player => {
    if (player && player.position) {
        groupedStarters[getPositionGroup(player.position)].push(player);
    }
  });


  return (
    <div className="mt-8">
        {/* Campo de Juego con Titulares */}
        <div className="bg-field-gradient p-4 rounded-lg border-2 border-white/20 shadow-2xl flex flex-col-reverse space-y-4 space-y-reverse">
            {Object.entries(groupedStarters).map(([group, players]) => (
                <div key={group} className={`flex items-center gap-2 ${getPositionAlignment(group as any)}`}>
                    {players.map(player => (
                         <div key={player!.player.id} className="flex flex-col items-center gap-1">
                            {player && !player.player.id.startsWith('placeholder') ? (
                                <>
                                    <PlayerChip player={player} />
                                    <Badge variant="outline" className="bg-background/70 backdrop-blur-sm border-white/20">{player.card.style}</Badge>
                                </>
                            ) : (
                                <EmptyChip position={player!.position} />
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>

        {/* Lista de Suplentes */}
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-center">Banquillo de Suplentes</h3>
            <div className="space-y-2 max-w-2xl mx-auto">
                 {substitutes.map((sub, index) => (
                    <PlayerRow key={sub?.player.id || `sub-${index}`} player={sub} title={teamSlots[index].starter?.position || `SUB ${index+1}`} />
                 ))}
            </div>
        </div>
    </div>
  );
}
