"use client";

import type { IdealTeamPlayer, Position } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAverage } from '@/lib/utils';
import { Shield, Users, Target, HandMetal } from 'lucide-react';

type IdealTeamDisplayProps = {
  team: (IdealTeamPlayer | null)[];
};

const PlayerDisplayCard = ({ player }: { player: IdealTeamPlayer | null }) => {
  if (!player || player.player.id.startsWith('placeholder')) {
    const position = player?.position;
    return (
      <Card className="bg-muted/30 border-dashed w-full h-full flex items-center justify-center min-h-[120px]">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{position ? `Vacante (${position})` : 'Vacante'}</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-card/80 w-full h-full flex flex-col min-h-[120px]">
      <CardContent className="p-3 text-center flex flex-col items-center justify-center h-full">
        <div className="text-2xl font-bold text-primary" style={{ textShadow: '0 0 6px hsl(var(--primary))' }}>
          {formatAverage(player.average)}
        </div>
        <p className="font-semibold leading-tight mt-1 text-base">{player.player.name}</p>
        <p className="text-xs text-muted-foreground truncate w-full px-1">{player.card.name}</p>
        <Badge variant="secondary" className="mt-2 bg-white/10">{player.position}</Badge>
      </CardContent>
    </Card>
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

  const goalkeepers = team.filter(p => p?.position === 'PT');
  const defenders = team.filter(p => p?.position && ['DFC', 'LI', 'LD'].includes(p.position));
  const midfielders = team.filter(p => p?.position && ['MCD', 'MC', 'MDI', 'MDD', 'MO'].includes(p.position));
  const forwards = team.filter(p => p?.position && ['EXI', 'EXD', 'SD', 'DC'].includes(p.position));

  const renderLine = (title: string, players: (IdealTeamPlayer | null)[], icon: React.ReactNode) => {
    if (players.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-xl font-headline text-primary/90 mb-4 flex items-center gap-3">
          {icon}
          {title}
        </h3>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4`}>
          {players.map((p, i) => <PlayerDisplayCard key={`${p?.player.id}-${p?.card.id}-${i}`} player={p} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {renderLine('Porteros', goalkeepers, <HandMetal className="h-5 w-5" />)}
      {renderLine('Defensas', defenders, <Shield className="h-5 w-5" />)}
      {renderLine('Mediocampistas', midfielders, <Users className="h-5 w-5" />)}
      {renderLine('Delanteros', forwards, <Target className="h-5 w-5" />)}
    </div>
  );
}
