"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRatingDialog } from '@/components/add-rating-dialog';
import { PlayerCard } from '@/components/player-card';
import { PositionIcon } from '@/components/position-icon';
import type { Player, PlayersByPosition, Position } from '@/lib/types';
import { positions } from '@/lib/types';

const initialPlayers: PlayersByPosition = {
  Forward: [
    { id: 'p1', name: 'L. Messi', position: 'Forward', cards: [
      { id: 'c1', name: 'Base Card', ratings: [8, 9, 7] },
      { id: 'c2', name: 'POTW 24/05', ratings: [10, 9] },
    ]},
    { id: 'p2', name: 'K. Mbappé', position: 'Forward', cards: [
      { id: 'c3', name: 'France Pack', ratings: [9, 9, 10] },
    ]},
  ],
  Midfielder: [
    { id: 'p3', name: 'K. De Bruyne', position: 'Midfielder', cards: [
      { id: 'c4', name: 'Base Card', ratings: [8, 8, 9] },
    ]},
  ],
  Defender: [
     { id: 'p4', name: 'V. van Dijk', position: 'Defender', cards: [
      { id: 'c5', name: 'Club Selection', ratings: [9, 8, 9] },
    ]},
  ],
  Goalkeeper: [],
};

type FormValues = {
  playerName: string;
  cardName: string;
  position: Position;
  rating: number;
};

export default function Home() {
  const [players, setPlayers] = useState<PlayersByPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedPlayers = localStorage.getItem('eFootTrackerPlayers');
      if (storedPlayers) {
        setPlayers(JSON.parse(storedPlayers));
      } else {
        setPlayers(initialPlayers);
      }
    } catch (error) {
      setPlayers(initialPlayers);
    }
  }, []);

  useEffect(() => {
    if (players) {
      localStorage.setItem('eFootTrackerPlayers', JSON.stringify(players));
    }
  }, [players]);

  const handleAddRating = (values: FormValues) => {
    if (!players) return;

    const { playerName, cardName, position, rating } = values;
    
    setPlayers(prev => {
      const newPlayers = JSON.parse(JSON.stringify(prev)) as PlayersByPosition;
      
      let player = Object.values(newPlayers).flat().find(p => p.name.toLowerCase() === playerName.toLowerCase());
      
      if (player) {
        // Player exists
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
          cards: [{ id: uuidv4(), name: cardName, ratings: [rating] }],
        };
        newPlayers[position].push(newPlayer);
      }
      
      toast({ title: "Success", description: `Rating for ${playerName} has been saved.` });
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
      toast({ title: "Player Removed", description: "The player has been successfully removed." });
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
        toast({ title: "Card Removed", description: "The player card has been successfully removed." });
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
        toast({ title: "Rating Removed", description: "The rating has been successfully removed." });
        return newPlayers;
    });
  };
  
  if (!players) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading Tracker...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline text-primary">
            eFootTracker
          </h1>
          <AddRatingDialog onAddRating={handleAddRating} />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="Forward" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            {positions.map((pos) => (
              <TabsTrigger key={pos} value={pos} className="py-2">
                <PositionIcon position={pos} className="mr-2 h-5 w-5"/>
                {pos}s
              </TabsTrigger>
            ))}
          </TabsList>

          {positions.map((pos) => (
            <TabsContent key={pos} value={pos} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    <p className="text-lg font-medium text-muted-foreground">No {pos.toLowerCase()}s yet.</p>
                    <p className="text-sm text-muted-foreground">Click 'Add Rating' to get started!</p>
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
