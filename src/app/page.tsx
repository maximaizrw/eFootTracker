"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRatingDialog } from '@/components/add-rating-dialog';
import { PlayerCard } from '@/components/player-card';
import { PositionIcon } from '@/components/position-icon';
import type { Player, PlayersByPosition, Position, PlayerStyle } from '@/lib/types';
import { positions } from '@/lib/types';

const initialPlayers: PlayersByPosition = {
  ARQUERO: [],
  DFC: [
     { id: 'p4', name: 'V. van Dijk', position: 'DFC', style: 'Ninguno', cards: [
      { id: 'c5', name: 'Club Selection', ratings: [9, 8, 9] },
    ]},
  ],
  LI: [],
  LD: [],
  MCD: [],
  MC: [
    { id: 'p3', name: 'K. De Bruyne', position: 'MC', style: 'Ninguno', cards: [
      { id: 'c4', name: 'Base Card', ratings: [8, 8, 9] },
    ]},
  ],
  MDI: [],
  MDD: [],
  MO: [],
  EXI: [],
  EXD: [],
  SD: [],
  DC: [
    { id: 'p1', name: 'L. Messi', position: 'DC', style: 'Señuelo', cards: [
      { id: 'c1', name: 'Base Card', ratings: [8, 9, 7] },
      { id: 'c2', name: 'POTW 24/05', ratings: [10, 9] },
    ]},
    { id: 'p2', name: 'K. Mbappé', position: 'DC', style: 'Cazagoles', cards: [
      { id: 'c3', name: 'France Pack', ratings: [9, 9, 10] },
    ]},
  ],
};

type FormValues = {
  playerName: string;
  cardName: string;
  position: Position;
  rating: number;
  style: PlayerStyle;
};

export default function Home() {
  const [players, setPlayers] = useState<PlayersByPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem('eFootTrackerPlayers');
      const playersData = storedPlayers ? JSON.parse(storedPlayers) : initialPlayers;

      const sanitizedPlayers = positions.reduce((acc, pos) => {
        const playersInPos = playersData[pos] || [];
        acc[pos] = playersInPos.map((p: any) => ({
          ...p,
          style: p.style || 'Ninguno'
        }));
        return acc;
      }, {} as PlayersByPosition);

      setPlayers(sanitizedPlayers);
    } catch (error) {
      console.error("Failed to load or parse players data, resetting to initial state.", error);
      const sanitizedInitial = positions.reduce((acc, pos) => {
        const initialPlayersInPos = (initialPlayers as Partial<PlayersByPosition>)[pos] || [];
         acc[pos] = initialPlayersInPos.map((p: any) => ({
            ...p,
            style: p.style || 'Ninguno'
        }));
        return acc;
      }, {} as PlayersByPosition);
      setPlayers(sanitizedInitial);
    }
  }, []);

  useEffect(() => {
    if (players) {
      localStorage.setItem('eFootTrackerPlayers', JSON.stringify(players));
    }
  }, [players]);

  const handleAddRating = (values: FormValues) => {
    if (!players) return;

    const { playerName, cardName, position, rating, style } = values;
    
    setPlayers(prev => {
      const newPlayers = JSON.parse(JSON.stringify(prev)) as PlayersByPosition;
      
      let player = Object.values(newPlayers).flat().find(p => p.name.toLowerCase() === playerName.toLowerCase());
      
      if (player) {
        // Player exists
        player.style = style;
        
        if(player.position !== position) {
          // move player if position changed
          newPlayers[player.position] = newPlayers[player.position].filter(p => p.id !== player!.id);
          player.position = position;
          newPlayers[position].push(player);
        }

        let card = player.cards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
        if (card) {
          // Card exists, add rating
          card.ratings.push(rating);
        } else {
          // Card doesn't exist, create new card
          player.cards.push({ id: uuidv4(), name: cardName, ratings: [rating] });
        }
      } else {
        // Player doesn't exist, create new player and card
        const newPlayer: Player = {
          id: uuidv4(),
          name: playerName,
          position: position,
          style: style,
          cards: [{ id: uuidv4(), name: cardName, ratings: [rating] }],
        };
        newPlayers[position].push(newPlayer);
      }
      
      toast({ title: "Éxito", description: `La valoración para ${playerName} ha sido guardada.` });
      return newPlayers;
    });
  };

  const handleDeletePlayer = (playerId: string) => {
    if (!players) return;
    setPlayers(prev => {
      const newPlayers = JSON.parse(JSON.stringify(prev)) as PlayersByPosition;
      for (const pos of positions) {
        newPlayers[pos] = newPlayers[pos].filter(p => p.id !== playerId);
      }
      toast({ title: "Jugador Eliminado", description: "El jugador ha sido eliminado correctamente." });
      return newPlayers;
    });
  };

  const handleDeleteCard = (playerId: string, cardId: string) => {
     if (!players) return;
     setPlayers(prev => {
        const newPlayers = JSON.parse(JSON.stringify(prev)) as PlayersByPosition;
        const player = Object.values(newPlayers).flat().find(p => p.id === playerId);
        if(player){
            player.cards = player.cards.filter(c => c.id !== cardId);
        }
        toast({ title: "Carta Eliminada", description: "La carta del jugador ha sido eliminada correctamente." });
        return newPlayers;
    });
  };

  const handleDeleteRating = (playerId: string, cardId: string, ratingIndex: number) => {
     if (!players) return;
     setPlayers(prev => {
        const newPlayers = JSON.parse(JSON.stringify(prev)) as PlayersByPosition;
        const player = Object.values(newPlayers).flat().find(p => p.id === playerId);
        if(player){
            const card = player.cards.find(c => c.id === cardId);
            if(card) {
                card.ratings.splice(ratingIndex, 1);
            }
        }
        toast({ title: "Valoración Eliminada", description: "La valoración ha sido eliminada correctamente." });
        return newPlayers;
    });
  };
  
  if (!players) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Cargando Tracker...</div>
      </div>
    );
  }
  
  const allPlayers = Object.values(players).flat();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline text-primary">
            eFootTracker
          </h1>
          <AddRatingDialog onAddRating={handleAddRating} players={allPlayers} />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="DC" className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-7 h-auto gap-1">
            {positions.map((pos) => (
              <TabsTrigger key={pos} value={pos} className="py-2">
                <PositionIcon position={pos} className="mr-2 h-5 w-5"/>
                {pos}
              </TabsTrigger>
            ))}
          </TabsList>

          {positions.map((pos) => (
            <TabsContent key={pos} value={pos} className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {players[pos].length > 0 ? (
                  players[pos].map((player) => (
                    <PlayerCard 
                      key={player.id} 
                      player={player} 
                      onDeletePlayer={handleDeletePlayer}
                      onDeleteCard={handleDeleteCard}
                      onDeleteRating={handleDeleteRating}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center text-center p-10 bg-card rounded-lg shadow-sm">
                    <p className="text-lg font-medium text-muted-foreground">Todavía no hay jugadores en la posición de {pos}.</p>
                    <p className="text-sm text-muted-foreground">¡Haz clic en 'Añadir Valoración' para empezar!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
