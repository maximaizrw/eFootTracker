
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { FormationStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Link as LinkIcon, Trophy, LayoutGrid, List, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from '@/lib/utils';

type FormationsDisplayProps = {
  formations: FormationStats[];
  onAddMatch: (formationId: string, formationName: string) => void;
  onDelete: (formation: FormationStats) => void;
  onEdit: (formation: FormationStats) => void;
  onViewImage: (url: string, name: string) => void;
};

const calculateStats = (matches: FormationStats['matches']) => {
  const total = matches.length;
  if (total === 0) {
    return { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, effectiveness: 0, total };
  }
  const wins = matches.filter(m => m.goalsFor > m.goalsAgainst).length;
  const draws = matches.filter(m => m.goalsFor === m.goalsAgainst).length;
  const losses = total - wins - draws;
  
  const goalsFor = matches.reduce((acc, m) => acc + m.goalsFor, 0);
  const goalsAgainst = matches.reduce((acc, m) => acc + m.goalsAgainst, 0);
  const goalDifference = goalsFor - goalsAgainst;

  const effectiveness = ((wins * 3 + draws) / (total * 3)) * 100;

  return { wins, draws, losses, goalsFor, goalsAgainst, goalDifference, effectiveness, total };
};


const FormationCard = ({ formation, onAddMatch, onDelete, onEdit, onViewImage }: Omit<FormationsDisplayProps, 'formations'> & { formation: FormationStats }) => {
    const stats = calculateStats(formation.matches);
    const effectivenessColor = 
      stats.effectiveness >= 66 ? 'text-green-400' :
      stats.effectiveness >= 33 ? 'text-yellow-400' :
      stats.total > 0 ? 'text-red-400' : 'text-muted-foreground';
    
    const gdColor =
      stats.goalDifference > 0 ? 'text-green-400' :
      stats.goalDifference < 0 ? 'text-red-400' :
      'text-muted-foreground';

    return (
      <Card key={formation.id} className="bg-card/60 border-white/10 flex flex-col">
        <CardHeader className="p-4 border-b border-white/10">
          <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">
                  {formation.name}
                  {formation.creator && <span className="block text-sm font-normal text-muted-foreground -mt-1">{formation.creator}</span>}
                </CardTitle>
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
          <div className="grid grid-cols-1 gap-2">
             {formation.imageUrl && (
                <button 
                  onClick={() => onViewImage(formation.imageUrl!, `${formation.name} - Táctica Principal`)}
                  className="block w-full focus:outline-none focus:ring-2 focus:ring-ring rounded-md overflow-hidden"
                >
                    <div className="aspect-video relative w-full bg-muted">
                        <Image
                          src={formation.imageUrl}
                          alt={`Táctica Principal de ${formation.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                    </div>
                  </button>
             )}
             {formation.secondaryImageUrl && (
                <button 
                  onClick={() => onViewImage(formation.secondaryImageUrl!, `${formation.name} - Táctica Secundaria`)}
                  className="block w-full focus:outline-none focus:ring-2 focus:ring-ring rounded-md overflow-hidden"
                >
                  <div className="aspect-video relative w-full bg-muted">
                      <Image
                        src={formation.secondaryImageUrl}
                        alt={`Táctica Secundaria de ${formation.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                  </div>
                </button>
             )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center border-b border-white/10 pb-3 mb-3 mt-4">
            <div className="text-green-400">
              <p className="text-2xl font-bold">{stats.wins}</p>
              <p className="text-xs">Victorias</p>
            </div>
             <div className="text-yellow-400">
              <p className="text-2xl font-bold">{stats.draws}</p>
              <p className="text-xs">Empates</p>
            </div>
            <div className="text-red-400">
              <p className="text-2xl font-bold">{stats.losses}</p>
              <p className="text-xs">Derrotas</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
             <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Partidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.goalsFor}</p>
              <p className="text-xs text-muted-foreground">GF</p>
            </div>
             <div>
              <p className="text-2xl font-bold">{stats.goalsAgainst}</p>
              <p className="text-xs text-muted-foreground">GC</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${gdColor}`}>{stats.goalDifference > 0 ? '+' : ''}{stats.goalDifference}</p>
              <p className="text-xs text-muted-foreground">DG</p>
            </div>
          </div>

           <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Efectividad</p>
              <p className={`text-3xl font-bold ${effectivenessColor}`}>{stats.effectiveness.toFixed(0)}%</p>
            </div>
        </CardContent>
        <CardFooter className="p-4 border-t border-white/10 flex justify-between">
          <Button onClick={() => onAddMatch(formation.id, formation.name)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Partido
          </Button>
          <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => onEdit(formation)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Editar Formación</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={() => onDelete(formation)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Eliminar Formación</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>
    );
};

const FormationRow = ({ formation, onAddMatch, onEdit, onDelete }: Omit<FormationsDisplayProps, 'formations' | 'onViewImage'> & { formation: FormationStats }) => {
    const stats = calculateStats(formation.matches);
     const effectivenessColor = 
      stats.effectiveness >= 66 ? 'text-green-400' :
      stats.effectiveness >= 33 ? 'text-yellow-400' :
      stats.total > 0 ? 'text-red-400' : 'text-muted-foreground';

    return (
        <div className="flex items-center justify-between p-4 bg-card/60 border border-white/10 rounded-lg">
            <div className="flex-1">
                <p className="text-lg font-semibold">{formation.name} {formation.creator && <span className="font-normal text-muted-foreground">- {formation.creator}</span>}</p>
                <p className="text-sm text-muted-foreground">{formation.playStyle}</p>
            </div>
            <div className="flex items-center gap-6 mx-6">
                <div className="text-center">
                    <p className="text-xl font-bold">{stats.wins}-{stats.draws}-{stats.losses}</p>
                    <p className="text-xs text-muted-foreground">V-E-D</p>
                </div>
                 <div className="text-center">
                    <p className={cn("text-xl font-bold", effectivenessColor)}>{stats.effectiveness.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Efectividad</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => onAddMatch(formation.id, formation.name)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Partido
                </Button>
                <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                           <Button variant="outline" size="icon" onClick={() => onEdit(formation)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Editar Formación</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => onDelete(formation)}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Eliminar Formación</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};

export function FormationsDisplay({ formations, onAddMatch, onDelete, onEdit, onViewImage }: FormationsDisplayProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <div>
        <div className="flex justify-end mb-4">
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
                <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula">
                    <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Vista de lista">
                    <List className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
        
        {viewMode === 'grid' ? (
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {formations.map((formation) => (
                    <FormationCard 
                        key={formation.id}
                        formation={formation}
                        onAddMatch={onAddMatch}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onViewImage={onViewImage}
                    />
                ))}
            </div>
        ) : (
            <div className="space-y-3">
                {formations.map((formation) => (
                     <FormationRow 
                        key={formation.id}
                        formation={formation}
                        onAddMatch={onAddMatch}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        )}
    </div>
  );
}
