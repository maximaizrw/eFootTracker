"use client";

import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, X, Wrench, Pencil } from 'lucide-react';
import { calculateAverage, cn, formatAverage } from '@/lib/utils';
import { getCardStyle } from '@/lib/card-styles';
import type { Player, PlayerCard, Position, FlatPlayer } from '@/lib/types';
import type { FormValues as AddRatingFormValues } from '@/components/add-rating-dialog';

type PlayerTableProps = {
  players: FlatPlayer[];
  position: Position;
  searchTerm: string;
  onOpenAddRating: (initialData?: Partial<AddRatingFormValues>) => void;
  onOpenEditCard: (player: Player, card: PlayerCard) => void;
  onOpenEditPlayer: (player: Player) => void;
  onViewImage: (url: string, name: string) => void;
  onDeleteCard: (playerId: string, cardId: string, position: Position) => void;
  onDeleteRating: (playerId: string, cardId: string, position: Position, ratingIndex: number) => void;
};

export function PlayerTable({
  players,
  position,
  searchTerm,
  onOpenAddRating,
  onOpenEditCard,
  onOpenEditPlayer,
  onViewImage,
  onDeleteCard,
  onDeleteRating,
}: PlayerTableProps) {
  
  if (players.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center text-center p-10">
        <p className="text-lg font-medium text-muted-foreground">
          {searchTerm ? `No se encontraron jugadores para "${searchTerm}" en ${position}.` : `Todavía no hay jugadores en la posición de ${position}.`}
        </p>
        <p className="text-sm text-muted-foreground">
          {searchTerm ? "Intenta con otro nombre o borra la búsqueda." : "¡Haz clic en 'Añadir Valoración' para empezar!"}
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
        {players.map(({ player, card, ratingsForPos }) => {
          const cardAverage = calculateAverage(ratingsForPos);
          const cardMatches = ratingsForPos.length;
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
                        <div className="font-medium text-base">{player.name}</div>
                        <Button
                            variant="ghost" size="icon" className="h-6 w-6 rounded-full"
                            aria-label={`Editar jugador ${player.name}`}
                            onClick={() => onOpenEditPlayer(player)}
                            >
                            <Pencil className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground" />
                        </Button>
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
                <div className={cn("text-xl font-bold", cardStyle ? specialTextClasses : "text-primary")} style={scoreGlowStyle}>
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
