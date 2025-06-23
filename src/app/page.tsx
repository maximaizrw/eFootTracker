"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddRatingDialog, type FormValues } from '@/components/add-rating-dialog';
import { PlayerCard } from '@/components/player-card';
import { PositionIcon } from '@/components/position-icon';
import type { Player, PlayersByPosition, Position, PlayerCard as PlayerCardType } from '@/lib/types';
import { positions } from '@/lib/types';

export default function Home() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "players"), (snapshot) => {
      try {
        const playersData = snapshot.docs.map(doc => {
            const data = doc.data();
            const style = data.style || 'Ninguno';
            return {
                id: doc.id,
                ...data,
                style: style
            } as Player;
        });
        setPlayers(playersData);
      } catch (error) {
          console.error("Error processing snapshot: ", error);
          toast({
              variant: "destructive",
              title: "Error de Datos",
              description: "No se pudieron procesar los datos de los jugadores."
          });
      }
    }, (error) => {
        console.error("Error fetching from Firestore: ", error);
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "No se pudo conectar a la base de datos. Comprueba la configuración."
        });
        setPlayers([]);
    });

    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    if (players !== null) {
      const grouped = positions.reduce((acc, pos) => {
        acc[pos] = [];
        return acc;
      }, {} as PlayersByPosition);
      
      players.forEach(player => {
        if (grouped[player.position]) {
          grouped[player.position].push(player);
        }
      });
      setPlayersByPosition(grouped);
    }
  }, [players]);

  const handleAddRating = async (values: FormValues) => {
    if (players === null) return;
    const { playerName, cardName, position, rating, style } = values;
    
    try {
      const existingPlayer = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
      
      if (existingPlayer) {
        const playerRef = doc(db, 'players', existingPlayer.id);
        const playerDoc = await getDoc(playerRef);
        if (!playerDoc.exists()) throw new Error("Player not found in DB.");
        
        const playerData = playerDoc.data() as Player;
        const newCards: PlayerCardType[] = [...playerData.cards];
        let card = newCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());

        if (card) {
          card.ratings.push(rating);
        } else {
          newCards.push({ id: uuidv4(), name: cardName, ratings: [rating] });
        }
        
        await updateDoc(playerRef, {
            position,
            style,
            cards: newCards
        });

      } else {
        const newPlayer = {
          name: playerName,
          position: position,
          style: style,
          cards: [{ id: uuidv4(), name: cardName, ratings: [rating] }],
        };
        await addDoc(collection(db, 'players'), newPlayer);
      }
      
      toast({ title: "Éxito", description: `La valoración para ${playerName} ha sido guardada.` });
    } catch (error) {
      console.error("Error adding rating: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo guardar la valoración.",
      });
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
        await deleteDoc(doc(db, 'players', playerId));
        toast({ title: "Jugador Eliminado", description: "El jugador ha sido eliminado." });
    } catch (error) {
        console.error("Error deleting player: ", error);
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo eliminar al jugador."
        });
    }
  };

  const handleDeleteCard = async (playerId: string, cardId: string) => {
     if (!players) return;
     const player = players.find(p => p.id === playerId);
     if (!player) return;

     const newCards = player.cards.filter(c => c.id !== cardId);

     try {
        await updateDoc(doc(db, 'players', playerId), { cards: newCards });
        toast({ title: "Carta Eliminada", description: "La carta ha sido eliminada." });
     } catch (error) {
        console.error("Error deleting card: ", error);
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo eliminar la carta."
        });
     }
  };

  const handleDeleteRating = async (playerId: string, cardId: string, ratingIndex: number) => {
    if (!players) return;
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCards = JSON.parse(JSON.stringify(player.cards)) as PlayerCardType[];
    const card = newCards.find(c => c.id === cardId);
    if(card) {
        card.ratings.splice(ratingIndex, 1);
    } else {
        return;
    }
    
    try {
        await updateDoc(doc(db, 'players', playerId), { cards: newCards });
        toast({ title: "Valoración Eliminada", description: "La valoración ha sido eliminada." });
    } catch (error) {
        console.error("Error deleting rating: ", error);
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo eliminar la valoración."
        });
    }
  };
  
  if (!playersByPosition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Conectando a la base de datos...</div>
      </div>
    );
  }
  
  const allPlayers = players || [];

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

          {positions.map((pos) => {
            const playersForPosition = playersByPosition[pos] || [];
            const flatPlayerList = playersForPosition.flatMap(player => 
              player.cards.map(card => ({ player, card }))
            );

            return (
              <TabsContent key={pos} value={pos} className="mt-6">
                <div className="grid grid-cols-1 gap-4">
                  {flatPlayerList.length > 0 ? (
                    flatPlayerList.map(({ player, card }) => (
                      <PlayerCard 
                        key={`${player.id}-${card.id}`} 
                        player={player}
                        card={card}
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
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}
