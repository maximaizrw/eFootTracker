
"use client";

import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, X, Wrench, Pencil, LineChart, Search, Zap, TrendingUp, Gem, Repeat } from 'lucide-react';
import { cn, formatAverage, getAverageColorClass } from '@/lib/utils';
import { getCardStyle } from '@/lib/card-styles';
import type { Player, PlayerCard, Position, FlatPlayer, PlayerPerformance } from '@/lib/types';
import type { FormValues as AddRatingFormValues } from '@/components/add-rating-dialog';

type PlayerTableProps = {
  players: FlatPlayer[];
  position: Position;
  onOpenAddRating: (initialData?: Partial<AddRatingFormValues>) => void;
  onOpenEditCard: (player: Player, card: PlayerCard) => void;
  onOpenEditPlayer: (player: Player) => void;
  onOpenPlayerDetail: (flatPlayer: FlatPlayer) => void;
  onViewImage: (url: string, name: string) => void;
  onDeletePlayer: (playerId: string) => void;
  onDeleteCard: (playerId: string, cardId: string, position: Position) => void;
  onDeleteRating: (playerId: string, cardId: string, position: Position, ratingIndex: number) => void;
};

type FilterProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  styleFilter: string;
  onStyleFilterChange: (value: string) => void;
  cardFilter: string;
  onCardFilterChange: (value: string) => void;
  uniqueStyles: string[];
  uniqueCardNames: string[];
  position: Position;
};

const Filters = ({
  searchTerm,
  onSearchTermChange,
  styleFilter,
  onStyleFilterChange,
  cardFilter,
  onCardFilterChange,
  uniqueStyles,
  uniqueCardNames,
  position
}: FilterProps) => (
  <div className="flex flex-col md:flex-row gap-2">
    <div className="relative flex-grow">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={`Buscar en ${position}...`}
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
    <Select value={styleFilter} onValueChange={onStyleFilterChange}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Filtrar por estilo" />
      </SelectTrigger>
      <SelectContent>
        {uniqueStyles.map(style => (
          <SelectItem key={style} value={style}>{style === 'all' ? 'Todos los Estilos' : style}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Select value={cardFilter} onValueChange={onCardFilterChange}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Filtrar por carta" />
      </SelectTrigger>
      <SelectContent>
        {uniqueCardNames.map(name => (
          <SelectItem key={name} value={name}>{name === 'all' ? 'Todas las Cartas' : name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (direction: 'next' | 'prev') => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange('prev')}
                disabled={currentPage === 0}
            >
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {currentPage + 1} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange('next')}
                disabled={currentPage >= totalPages - 1}
            >
                Siguiente
            </Button>
        </div>
    );
};

const PerformanceBadges = ({ performance }: { performance: PlayerPerformance }) => {
    if (!performance) return null;

    return (
        <div className="flex items-center gap-1.5">
            {performance.isHotStreak && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <TrendingUp className="h-4 w-4 text-orange-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>En Racha (Mejor rendimiento reciente)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
            {performance.isConsistent && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Repeat className="h-4 w-4 text-cyan-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>Consistente (Valoraciones muy estables)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
            {performance.isVersatile && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                           <Gem className="h-4 w-4 text-purple-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>Versátil (Rinde bien en múltiples posiciones)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
             {performance.isPromising && (
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Zap className="h-4 w-4 text-yellow-400" />
                        </TooltipTrigger>
                        <TooltipContent><p>Promesa (Pocos partidos, gran promedio)</p></TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            )}
        </div>
    );
}

export function PlayerTable({
  players: flatPlayers,
  position,
  onOpenAddRating,
  onOpenEditCard,
  onOpenEditPlayer,
  onOpenPlayerDetail,
  onViewImage,
  onDeletePlayer,
  onDeleteCard,
  onDeleteRating,
}: PlayerTableProps) {
  
  if (flatPlayers.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center text-center p-10">
        <p className="text-lg font-medium text-muted-foreground">
          {`Todavía no hay jugadores en la posición de ${position}.`}
        </p>
        <p className="text-sm text-muted-foreground">
          {"¡Haz clic en 'Añadir Valoración' para empezar!"}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b-white/10 hover:bg-white/5">
          <TableHead className="w-[30%]">Jugador</TableHead>
          <TableHead>Estilo</TableHead>
          <TableHead>Prom.</TableHead>
          <TableHead>Partidos</TableHead>
          <TableHead className="w-[35%]">Valoraciones</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flatPlayers.map((flatPlayer) => {
          const { player, card, ratingsForPos, performance } = flatPlayer;
          const cardAverage = performance.stats.average;
          const cardMatches = performance.stats.matches;
          const cardStyle = getCardStyle(card.name);

          const rowStyle = cardStyle
            ? ({ '--card-color': `hsl(var(--tw-${cardStyle.tailwindClass}))` } as React.CSSProperties)
            : {};

          const rowClasses = cn(
            "border-b-white/10 transition-colors",
            cardStyle ? `bg-[--card-color]/10 hover:bg-[--card-color]/20` : "hover:bg-white/5"
          );
          
          const specialTextClasses = cn(
              "font-semibold",
              cardStyle ? `text-[--card-color]` : ""
          );
          
          const scoreGlowStyle = cardStyle
            ? { textShadow: `0 0 6px var(--card-color)` }
            : { textShadow: '0 0 8px hsl(var(--primary))' };
          
          const averageColorClass = getAverageColorClass(cardAverage);

          return (
             <TableRow key={`${player.id}-${card.id}-${position}`} className={rowClasses} style={rowStyle}>
              <TableCell>
                <div className="flex items-center gap-3">
                  {card.imageUrl ? (
                    <button onClick={() => onViewImage(card.imageUrl!, `${player.name} - ${card.name}`)} className="focus:outline-none focus:ring-2 focus:ring-ring rounded">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        width={40}
                        height={40}
                        className="bg-transparent object-contain"
                      />
                    </button>
                  ) : (
                    <div className="w-[40px] h-[40px] flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onOpenPlayerDetail(flatPlayer)}
                            className="font-medium text-base hover:underline"
                        >
                            {player.name}
                        </button>
                        <PerformanceBadges performance={performance} />
                        <TooltipProvider>
                           <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost" size="icon" className="h-6 w-6 rounded-full"
                                        aria-label={`Editar jugador ${player.name}`}
                                        onClick={() => onOpenEditPlayer(player)}
                                        >
                                        <Pencil className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Editar nombre del jugador</p></TooltipContent>
                           </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className={cn("text-sm", cardStyle ? specialTextClasses : 'text-muted-foreground')}>{card.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {card.style && card.style !== "Ninguno" ? (
                  <Badge variant="secondary" className="bg-white/10 text-white/80">{card.style}</Badge>
                ) : <span className="text-muted-foreground">-</span>}
              </TableCell>
              <TableCell>
                 <div className={cn("text-xl font-bold", cardStyle ? specialTextClasses : averageColorClass)} style={scoreGlowStyle}>
                  {formatAverage(cardAverage)}
                </div>
              </TableCell>
              <TableCell className="text-center">{cardMatches}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                  {ratingsForPos.slice(-5).map((rating, index) => {
                      const originalIndex = Math.max(0, ratingsForPos.length - 5) + index;
                      return (
                        <div key={originalIndex} className="group/rating relative">
                          <Badge variant="default" className="text-sm bg-primary/80 text-primary-foreground">
                            {rating.toFixed(1)}
                          </Badge>
                          <Button
                            size="icon" variant="destructive"
                            className="absolute -top-2 -right-2 h-4 w-4 rounded-full opacity-0 group-hover/rating:opacity-100 transition-opacity z-10"
                            onClick={() => onDeleteRating(player.id, card.id, position, originalIndex)}
                            aria-label={`Eliminar valoración ${rating}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Ver estadísticas de ${player.name}`}
                          onClick={() => onOpenPlayerDetail(flatPlayer)}
                      >
                          <LineChart className="h-4 w-4 text-accent/80 hover:text-accent" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Ver estadísticas detalladas</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Añadir valoración a ${player.name} (${card.name})`}
                          onClick={() => onOpenAddRating({
                              playerId: player.id,
                              playerName: player.name,
                              cardName: card.name,
                              position: position,
                              style: card.style
                          })}
                      >
                          <PlusCircle className="h-4 w-4 text-primary/80 hover:text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Añadir valoración</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                        aria-label={`Editar carta ${card.name}`}
                        onClick={() => onOpenEditCard(player, card)}
                        >
                        <Wrench className="h-4 w-4 text-muted-foreground/80 hover:text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Editar carta (nombre, estilo e imagen)</p></TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 rounded-full"
                        aria-label={`Eliminar valoraciones de ${card.name} (${player.name}) para la posición ${position}`}
                        onClick={() => onDeleteCard(player.id, card.id, position)}>
                        <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Eliminar todas las valoraciones para esta posición</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

PlayerTable.Filters = Filters;
PlayerTable.Pagination = Pagination;

    