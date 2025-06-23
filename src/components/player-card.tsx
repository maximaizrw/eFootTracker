"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

import type { Player } from "@/lib/types";
import { calculateAverage, formatAverage } from "@/lib/utils";
import { PositionIcon } from "./position-icon";

type PlayerCardProps = {
  player: Player;
  onDeletePlayer: (playerId: string) => void;
  onDeleteCard: (playerId: string, cardId: string) => void;
  onDeleteRating: (playerId: string, cardId: string, ratingIndex: number) => void;
};

export function PlayerCard({ player, onDeletePlayer, onDeleteCard, onDeleteRating }: PlayerCardProps) {
  const totalMatches = player.cards.reduce((sum, card) => sum + card.ratings.length, 0);

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="flex flex-row items-start bg-card p-4">
        <div className="flex-grow">
          <CardTitle className="font-headline text-2xl flex items-center gap-3">
             <PositionIcon position={player.position} className="h-6 w-6 text-primary" />
            {player.name}
          </CardTitle>
          <CardDescription>{player.position}</CardDescription>
          {player.style && player.style !== 'Ninguno' && (
              <Badge variant="secondary" className="mt-2 font-normal">{player.style}</Badge>
          )}
        </div>
        <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-primary">{totalMatches}</span>
            <span className="text-xs text-muted-foreground">Partidos Jugados</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {player.cards.length > 0 && (
          <Accordion type="single" collapsible className="w-full" defaultValue={player.cards.length > 0 ? player.cards[0].id : undefined}>
            {player.cards.map((card) => {
              const cardAverage = calculateAverage(card.ratings);
              const cardMatches = card.ratings.length;
              return (
                <AccordionItem value={card.id} key={card.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-2">
                        <span className="font-medium">{card.name}</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{`${formatAverage(cardAverage)} prom. (${cardMatches} ${cardMatches === 1 ? 'partido' : 'partidos'})`}</Badge>
                             <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); onDeleteCard(player.id, card.id); }}
                                aria-label={`Eliminar la carta ${card.name}`}
                              >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Button variant="destructive" size="sm" className="w-full" onClick={() => onDeletePlayer(player.id)}>
            <X className="mr-2 h-4 w-4"/> Eliminar Jugador
        </Button>
      </CardFooter>
    </Card>
  );
}
