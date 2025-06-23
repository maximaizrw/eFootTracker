"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Player, PlayerCard as PlayerCardType } from "@/lib/types";
import { calculateAverage, formatAverage } from "@/lib/utils";
import { PositionIcon } from "./position-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { FormValues } from "./add-rating-dialog";

type PlayerCardProps = {
  player: Player;
  card: PlayerCardType;
  onDeleteCard: (playerId: string, cardId: string) => void;
  onDeleteRating: (
    playerId: string,
    cardId: string,
    ratingIndex: number
  ) => void;
  onAddQuickRating: (initialData: Partial<FormValues>) => void;
};

export function PlayerCard({
  player,
  card,
  onDeleteCard,
  onDeleteRating,
  onAddQuickRating,
}: PlayerCardProps) {
  const cardAverage = calculateAverage(card.ratings);
  const cardMatches = card.ratings.length;
  const cardNameLower = card.name.toLowerCase();
  const isEuroPotw = cardNameLower.includes("potw european club championship");
  const isGenericPotw = !isEuroPotw && cardNameLower.includes("potw");
  const isTsubasa = cardNameLower.includes("captain tsubasa collaboration campaign");
  const isSpecialCard = isEuroPotw || isGenericPotw || isTsubasa;

  const scoreGlowStyle = isTsubasa
    ? { textShadow: '0 0 10px #0B1F4D' }
    : isEuroPotw
    ? { textShadow: '0 0 10px #E020E0' }
    : isGenericPotw
    ? { textShadow: '0 0 10px #39FF14' }
    : { textShadow: '0 0 8px hsl(var(--primary))' };

  return (
    <Card
      className={cn(
        "relative group w-full overflow-hidden transition-all duration-300 bg-card/60 backdrop-blur-sm border",
        "hover:shadow-lg hover:border-primary/50",
        isTsubasa && "border-tsubasa-blue border-2 shadow-tsubasa-blue/20",
        isEuroPotw && "border-potw-euro border-2 shadow-potw-euro/20",
        isGenericPotw && "border-potw-green border-2 shadow-potw-green/20",
        !isSpecialCard && "border-white/10"
      )}
    >
      <Button
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={() => onDeleteCard(player.id, card.id)}
        aria-label={`Eliminar la carta ${card.name}`}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="flex flex-row items-start bg-transparent p-4">
        <div className="flex-grow">
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
            <PositionIcon
              position={player.position}
              className="h-6 w-6 text-primary"
            />
            {player.name}
          </CardTitle>
          <CardDescription>{card.name}</CardDescription>
          {player.style && player.style !== "Ninguno" && (
            <Badge variant="secondary" className="mt-2 font-normal bg-white/10 text-white/80">
              {player.style}
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span
            className={cn(
              "text-4xl font-bold",
              isTsubasa
                ? "text-tsubasa-blue"
                : isEuroPotw
                ? "text-potw-euro"
                : isGenericPotw
                ? "text-potw-green"
                : "text-primary"
            )}
            style={scoreGlowStyle}
          >
            {formatAverage(cardAverage)}
          </span>
          <span className="text-xs text-muted-foreground">{`${cardMatches} ${
            cardMatches === 1 ? "partido" : "partidos"
          }`}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap items-center gap-2 p-2 bg-black/20 rounded-md">
          {card.ratings.length > 0 ? (
            card.ratings.map((rating, index) => (
              <div key={index} className="group relative">
                <Badge variant="default" className="text-sm bg-primary/80 text-primary-foreground">
                  {rating}
                </Badge>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-3 -right-3 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteRating(player.id, card.id, index)}
                  aria-label={`Eliminar valoración ${rating}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay valoraciones para esta carta.
            </p>
          )}
           <TooltipProvider>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => onAddQuickRating({
                              playerName: player.name,
                              cardName: card.name,
                              position: player.position,
                              style: player.style
                          })}
                      >
                          <PlusCircle className="h-4 w-4 text-primary/80 hover:text-primary transition-colors" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Añadir valoración rápida</p>
                  </TooltipContent>
              </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
