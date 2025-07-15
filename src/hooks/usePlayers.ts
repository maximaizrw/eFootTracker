
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { Player, PlayerCard, Position, PlayersByPosition, AddRatingFormValues, EditCardFormValues, EditPlayerFormValues } from '@/lib/types';
import { positions } from '@/lib/types';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      const errorMessage = "La configuración de Firebase no está completa. Revisa que las variables de entorno se hayan añadido correctamente.";
      setError(errorMessage);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(collection(db, "players"), (snapshot) => {
      try {
        const playersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                cards: (data.cards || []).map((card: any) => ({
                    ...card,
                    style: card.style || 'Ninguno',
                    imageUrl: card.imageUrl || '',
                    ratingsByPosition: card.ratingsByPosition || {}
                })),
            } as Player;
        });
        setPlayers(playersData);
        setError(null);
      } catch (err) {
          console.error("Error processing players snapshot: ", err);
          setError("No se pudieron procesar los datos de los jugadores.");
          toast({
              variant: "destructive",
              title: "Error de Datos",
              description: "No se pudieron procesar los datos de los jugadores.",
          });
      } finally {
        setLoading(false);
      }
    }, (err) => {
        console.error("Error fetching players from Firestore: ", err);
        setError("No se pudo conectar a la base de datos para leer jugadores.");
        setPlayers([]);
        setLoading(false);
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "No se pudo conectar a la base de datos para leer jugadores."
        });
    });

    return () => unsub();
  }, [toast]);

  useEffect(() => {
    if (players !== null) {
      const grouped = positions.reduce((acc, pos) => {
        acc[pos] = [];
        return acc;
      }, {} as PlayersByPosition);
      
      players.forEach(player => {
        const playerPositions = new Set<Position>();
        (player.cards || []).forEach(card => {
          Object.keys(card.ratingsByPosition || {}).forEach(pos => {
            if ((card.ratingsByPosition?.[pos as Position] ?? []).length > 0) {
              playerPositions.add(pos as Position);
            }
          });
        });

        playerPositions.forEach(pos => {
          if (grouped[pos]) {
            grouped[pos].push(player);
          }
        });
      });
      setPlayersByPosition(grouped);
    }
  }, [players]);

  const addRating = async (values: AddRatingFormValues) => {
    const { playerId, playerName, cardName, position, rating, style } = values;
    try {
      if (playerId) {
        const playerRef = doc(db, 'players', playerId);
        const playerDoc = await getDoc(playerRef);
        if (!playerDoc.exists()) throw new Error("Player not found");
        
        const playerData = playerDoc.data() as Player;
        const newCards: PlayerCard[] = JSON.parse(JSON.stringify(playerData.cards || []));
        let card = newCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());

        if (card) {
          if (!card.ratingsByPosition) card.ratingsByPosition = {};
          if (!card.ratingsByPosition[position]) card.ratingsByPosition[position] = [];
          card.ratingsByPosition[position]!.push(rating);
        } else {
          card = { id: uuidv4(), name: cardName, style: style, imageUrl: '', ratingsByPosition: { [position]: [rating] } };
          newCards.push(card);
        }
        await updateDoc(playerRef, { cards: newCards });
      } else {
        const newPlayer = {
          name: playerName,
          cards: [{ id: uuidv4(), name: cardName, style: style, imageUrl: '', ratingsByPosition: { [position]: [rating] } }],
        };
        await addDoc(collection(db, 'players'), newPlayer);
      }
      toast({ title: "Éxito", description: `La valoración para ${playerName} ha sido guardada.` });
    } catch (error) {
      console.error("Error adding rating: ", error);
      toast({ variant: "destructive", title: "Error al Guardar", description: "No se pudo guardar la valoración." });
    }
  };

  const editCard = async (values: EditCardFormValues) => {
    const player = players.find(p => p.id === values.playerId);
    if (!player) return;

    const newCards = JSON.parse(JSON.stringify(player.cards)) as PlayerCard[];
    const cardToUpdate = newCards.find(c => c.id === values.cardId);

    if (cardToUpdate) {
        cardToUpdate.name = values.currentCardName;
        cardToUpdate.style = values.currentStyle;
        cardToUpdate.imageUrl = values.imageUrl || '';
        try {
            await updateDoc(doc(db, 'players', values.playerId), { cards: newCards });
            toast({ title: "Carta Actualizada", description: "Los datos de la carta se han actualizado." });
        } catch (error) {
            console.error("Error updating card: ", error);
            toast({ variant: "destructive", title: "Error al Actualizar", description: "No se pudieron guardar los cambios." });
        }
    }
  };

  const editPlayer = async (values: EditPlayerFormValues) => {
    try {
      await updateDoc(doc(db, 'players', values.playerId), { name: values.currentPlayerName });
      toast({ title: "Jugador Actualizado", description: "El nombre del jugador se ha actualizado." });
    } catch (error) {
      console.error("Error updating player: ", error);
      toast({ variant: "destructive", title: "Error al Actualizar", description: "No se pudo guardar el cambio de nombre." });
    }
  };

  const deletePlayer = async (playerId: string) => {
    try {
        await deleteDoc(doc(db, 'players', playerId));
        toast({ title: "Jugador Eliminado", description: "El jugador ha sido eliminado." });
    } catch (error) {
        console.error("Error deleting player: ", error);
        toast({ variant: "destructive", title: "Error al Eliminar", description: "No se pudo eliminar al jugador." });
    }
  };

  const deleteCard = async (playerId: string, cardId: string, position: Position) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCards: PlayerCard[] = JSON.parse(JSON.stringify(player.cards));
    const cardToUpdate = newCards.find(c => c.id === cardId);

    if (!cardToUpdate?.ratingsByPosition?.[position]) {
        toast({ variant: "destructive", title: "Error", description: "No se encontraron valoraciones para esta posición." });
        return;
    }
    
    delete cardToUpdate.ratingsByPosition[position];

    const hasRatingsLeft = Object.keys(cardToUpdate.ratingsByPosition).length > 0;
    const finalCards = hasRatingsLeft ? newCards.map(c => c.id === cardId ? cardToUpdate : c) : newCards.filter(c => c.id !== cardId);

    try {
        await updateDoc(doc(db, 'players', playerId), { cards: finalCards });
        toast({ title: "Acción Completada", description: `Se eliminaron las valoraciones de ${player.name} para la posición ${position}.` });
    } catch (error) {
        console.error("Error deleting position ratings: ", error);
        toast({ variant: "destructive", title: "Error al Eliminar", description: "No se pudo completar la acción." });
    }
  };

  const deleteRating = async (playerId: string, cardId: string, position: Position, ratingIndex: number) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCards = JSON.parse(JSON.stringify(player.cards)) as PlayerCard[];
    const card = newCards.find(c => c.id === cardId);
    
    if(card?.ratingsByPosition?.[position]) {
        card.ratingsByPosition[position]!.splice(ratingIndex, 1);
        if (card.ratingsByPosition[position]!.length === 0) {
            delete card.ratingsByPosition[position];
        }
    } else {
        return;
    }
    
    try {
        await updateDoc(doc(db, 'players', playerId), { cards: newCards });
        toast({ title: "Valoración Eliminada", description: "La valoración ha sido eliminada." });
    } catch (error) {
        console.error("Error deleting rating: ", error);
        toast({ variant: "destructive", title: "Error al Eliminar", description: "No se pudo eliminar la valoración." });
    }
  };

  const downloadBackup = async () => {
    if (!db) return null;
    try {
      const playersCollection = collection(db, 'players');
      const playerSnapshot = await getDocs(playersCollection);
      return playerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching players for backup: ", error);
      return null;
    }
  };

  return { players, playersByPosition, loading, error, addRating, editCard, editPlayer, deletePlayer, deleteCard, deleteRating, downloadBackup };
}
