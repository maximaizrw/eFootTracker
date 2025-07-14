"use client";

import type { IdealTeamPlayer, Position } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAverage } from '@/lib/utils';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';


type IdealTeamDisplayProps = {
  team: (IdealTeamPlayer | null)[];
};

const PlayerDisplayCard = ({ player }: { player: IdealTeamPlayer | null }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    const position = player?.position;
    return (
      <div className="flex flex-col items-center justify-center text-center w-full max-w-[6rem] h-32">
        <div className="w-16 h-16 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-white/30">
          <span className="text-xs text-white/50">{position}</span>
        </div>
        <p className="text-xs text-white/70 mt-1 truncate w-full">Vacante</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center text-center w-full max-w-[6rem] h-32 group">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/50 shadow-lg transition-all duration-300 group-hover:scale-110">
          {player.card.imageUrl ? (
              <Image 
                  src={player.card.imageUrl}
                  alt={player.card.name}
                  fill
                  sizes="64px"
                  className="object-cover bg-muted/40"
              />
          ) : (
              <div className="w-full h-full bg-muted/40 flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground/60" />
              </div>
          )}
           <div 
              className="absolute top-0 right-0 text-xs font-bold text-white rounded-full bg-primary/80 backdrop-blur-sm h-5 w-5 flex items-center justify-center border border-white/50"
              style={{ textShadow: '0 1px 1px rgba(0,0,0,0.7)' }}
            >
              {formatAverage(player.average)}
            </div>
        </div>
        <p className="font-semibold leading-tight mt-2 text-sm text-white truncate w-full" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            {player.player.name}
        </p>
        <p className="text-xs text-white/60 truncate w-full px-1">{player.card.name}</p>
    </div>
  );
};

const renderLine = (players: (IdealTeamPlayer | null)[], positions: Position[]) => {
    const filteredPlayers = positions.flatMap(pos => players.filter(p => p?.position === pos));
    if (filteredPlayers.length === 0) return null;

    return (
        <div className="flex justify-evenly items-center w-full gap-1 md:gap-2">
            {filteredPlayers.map((p, i) => (
                <PlayerDisplayCard key={`${p?.player.id}-${p?.card.id}-${i}`} player={p} />
            ))}
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
    <div className="mt-8">
       <div className="relative bg-field-gradient rounded-lg p-4 md:p-8 aspect-[4/3] max-w-4xl mx-auto flex flex-col justify-around border-2 border-white/20 shadow-2xl">
            {/* Field Markings */}
            <div className="absolute inset-0 opacity-15">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Goal boxes */}
                <div className="absolute top-1/2 left-0 h-2/5 w-12 md:w-16 border-y-2 border-r-2 border-white rounded-r-lg -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-0 h-2/5 w-12 md:w-16 border-y-2 border-l-2 border-white rounded-l-lg -translate-y-1/2"></div>
            </div>

            {/* Player Lines - from top to bottom (Attack to Defense) */}
            <div className="relative z-10 flex flex-col justify-around h-full space-y-4">
                {renderLine(team, ['EXI', 'DC', 'EXD'])}
                {renderLine(team, ['SD'])}
                {renderLine(team, ['MO'])}
                {renderLine(team, ['MDI', 'MC', 'MDD'])}
                {renderLine(team, ['MCD'])}
                {renderLine(team, ['LI', 'DFC', 'LD'])}
                {renderLine(team, ['PT'])}
            </div>
        </div>
    </div>
  );
}
