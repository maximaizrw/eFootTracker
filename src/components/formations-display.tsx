
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { FormationStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CirclePlus, CircleMinus, Equal, Trash2, Link as LinkIcon, Trophy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FormationsDisplayProps = {
  formations: FormationStats[];
  onAddResult: (formationId: string, outcome: 'win' | 'draw' | 'loss') => void;
  onDelete: (formationId: string) => void;
};

const calculateStats = (matches: FormationStats['matches']) => {
  const total = matches.length;
  if (total === 0) {
    return { wins: 0, draws: 0, losses: 0, effectiveness: 0, total };
  }
  const wins = matches.filter(m => m.outcome === 'win').length;
  const draws = matches.filter(m => m.outcome === 'draw').length;
  const losses = matches.filter(m => m.outcome === 'loss').length;
  const effectiveness = ((wins * 3 + draws) / (total * 3)) * 100;

  return { wins, draws, losses, effectiveness, total };
};

export function FormationsDisplay({ formations, onAddResult, onDelete }: FormationsDisplayProps) {
  if (formations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-card/80 rounded-lg shadow-sm border border-dashed border-white/10">
        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Todavía no has añadido ninguna formación.</p>
        <p className="text-sm text-muted-foreground">Haz clic en 'Añadir Formación' para empezar a registrar su rendimiento.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {formations.map((formation) => {
        const stats = calculateStats(formation.matches);
        const effectivenessColor = 
          stats.effectiveness >= 66 ? 'text-green-400' :
          stats.effectiveness >= 33 ? 'text-yellow-400' :
          stats.total > 0 ? 'text-red-400' : 'text-muted-foreground';

        return (
          <Card key={formation.id} className="bg-card/60 border-white/10 flex flex-col">
            <CardHeader className="p-4 border-b border-white/10">
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{formation.name}</CardTitle>
                    <CardDescription>{formation.playStyle}</CardDescription>
                  </div>
                  {formation.sourceUrl && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={formation.sourceUrl} target="_blank">
                                        <LinkIcon className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Ver fuente</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                  )}
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <div className="aspect-video relative w-full mb-4 rounded-md overflow-hidden bg-muted">
                <Image
                  src={formation.imageUrl}
                  alt={`Formación ${formation.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Partidos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
                  <p className="text-xs text-muted-foreground">Victorias</p>
                </div>
                 <div>
                  <p className="text-2xl font-bold text-yellow-400">{stats.draws}</p>
                  <p className="text-xs text-muted-foreground">Empates</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
                  <p className="text-xs text-muted-foreground">Derrotas</p>
                </div>
              </div>
               <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Efectividad</p>
                  <p className={`text-3xl font-bold ${effectivenessColor}`}>{stats.effectiveness.toFixed(0)}%</p>
                </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-white/10 flex justify-between">
              <div className="flex gap-2">
                <TooltipProvider>
                    <Tooltip><TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => onAddResult(formation.id, 'win')}>
                            <CirclePlus className="h-5 w-5 text-green-400" />
                        </Button>
                    </TooltipTrigger><TooltipContent><p>Añadir Victoria</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => onAddResult(formation.id, 'draw')}>
                            <Equal className="h-5 w-5 text-yellow-400" />
                        </Button>
                    </TooltipTrigger><TooltipContent><p>Añadir Empate</p></TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => onAddResult(formation.id, 'loss')}>
                            <CircleMinus className="h-5 w-5 text-red-400" />
                        </Button>
                    </TooltipTrigger><TooltipContent><p>Añadir Derrota</p></TooltipContent></Tooltip>
                </TooltipProvider>
              </div>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={() => onDelete(formation.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Eliminar Formación</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
