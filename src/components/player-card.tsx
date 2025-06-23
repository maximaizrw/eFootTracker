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
import { X } from "lucide-react";

import type { Player, PlayerCard as PlayerCardType } from "@/lib/types";
import { calculateAverage, formatAverage } from "@/lib/utils";
import { PositionIcon } from "./position-icon";

type PlayerCardProps = {
  player: Player;
  card: PlayerCardType;
  onDeleteCard: (playerId: string, cardId: string) => void;
  onDeleteRating: (playerId: string, cardId: string, ratingIndex: number) => void;
};

export function PlayerCard({ player, card, onDeleteCard, onDeleteRating }: PlayerCardProps) {
  const cardAverage = calculateAverage(card.ratings);
  const cardMatches = card.ratings.length;

  return (
    <Card className="relative group w-full overflow-hidden transition-all hover:shadow-lg">
       <Button 
        size="icon"
        variant="destructive"
        className="absolute top-2 right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={() => onDeleteCard(player.id, card.id)}
        aria-label={`Eliminar la carta ${card.name}`}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardHeader className="flex flex-row items-start bg-card p-4">
        <div className="flex-grow">
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
             <PositionIcon position={player.position} className="h-6 w-6 text-primary" />
            {player.name}
          </CardTitle>
          <CardDescription>{card.name}</CardDescription>
          {player.style && player.style !== 'Ninguno' && (
              <Badge variant="secondary" className="mt-2 font-normal">{player.style}</Badge>
          )}
        </div>
        <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-primary">{formatAverage(cardAverage)}</span>
            <span className="text-xs text-muted-foreground">{`${cardMatches} ${cardMatches === 1 ? 'partido' : 'partidos'}`}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
         <div className="flex flex-wrap gap-2 p-2 bg-secondary/50 rounded-md">
            {card.ratings.length > 0 ? (
              card.ratings.map((rating, index) => (
                <div key={index} className="group relative">
                  <Badge variant="default" className="text-sm">{rating}</Badge>
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
              <p className="text-sm text-muted-foreground">Aún no hay valoraciones para esta carta.</p>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
