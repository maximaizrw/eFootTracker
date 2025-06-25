"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddRatingDialog, type FormValues } from '@/components/add-rating-dialog';
import { PositionIcon } from '@/components/position-icon';
import type { Player, PlayersByPosition, Position, PlayerCard as PlayerCardType } from '@/lib/types';
import { positions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { calculateAverage, cn, formatAverage } from '@/lib/utils';

export default function Home() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Position>('DC');
  const [isAddRatingDialogOpen, setAddRatingDialogOpen] = useState(false);
  const [dialogInitialData, setDialogInitialData] = useState<Partial<FormValues> | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    setError(null);

    if (!db) {
      const errorMessage = "La configuración de Firebase no está completa. Revisa que las variables de entorno se hayan añadido correctamente en la configuración de tu proyecto en Vercel y que hayas hecho un 'Redeploy'.";
      setError(errorMessage);
      setPlayers([]);
      toast({
          variant: "destructive",
          title: "Error de Configuración",
          description: errorMessage,
      });
      return;
    }
    
    const unsubscribe = onSnapshot(collection(db, "players"), (snapshot) => {
      try {
        const playersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                style: data.style || 'Ninguno',
                cards: (data.cards || []).map((card: any) => ({
                    ...card,
                    ratingsByPosition: card.ratingsByPosition || {}
                })),
            } as Player;
        });
        setPlayers(playersData);
      } catch (error) {
          console.error("Error processing snapshot: ", error);
          const errorMessage = "No se pudieron procesar los datos de los jugadores. Revisa la consola para más detalles.";
          setError(errorMessage);
          toast({
              variant: "destructive",
              title: "Error de Datos",
              description: errorMessage,
          });
      }
    }, (err) => {
        console.error("Error fetching from Firestore: ", err);
        const errorMessage = "No se pudo conectar a la base de datos. Comprueba la configuración de Firebase en Vercel y las reglas de seguridad de Firestore.";
        setError(errorMessage);
        setPlayers([]);
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: errorMessage
        });
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
  
  const handleOpenAddRating = (initialData?: Partial<FormValues>) => {
    setDialogInitialData(initialData);
    setAddRatingDialogOpen(true);
  };

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
        const newCards: PlayerCardType[] = JSON.parse(JSON.stringify(playerData.cards || []));
        let card = newCards.find(c => c.name.toLowerCase() === cardName.toLowerCase());

        if (card) {
          if (!card.ratingsByPosition) {
            card.ratingsByPosition = {};
          }
          if (!card.ratingsByPosition[position]) {
            card.ratingsByPosition[position] = [];
          }
          card.ratingsByPosition[position]!.push(rating);
        } else {
          newCards.push({ id: uuidv4(), name: cardName, ratingsByPosition: { [position]: [rating] } });
        }
        
        await updateDoc(playerRef, {
            style,
            cards: newCards
        });

      } else {
        const newPlayer = {
          name: playerName,
          style: style,
          cards: [{ id: uuidv4(), name: cardName, ratingsByPosition: { [position]: [rating] } }],
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

  const handleDeleteRating = async (playerId: string, cardId: string, position: Position, ratingIndex: number) => {
    if (!players) return;
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCards = JSON.parse(JSON.stringify(player.cards)) as PlayerCardType[];
    const card = newCards.find(c => c.id === cardId);
    
    if(card && card.ratingsByPosition && card.ratingsByPosition[position]) {
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
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo eliminar la valoración."
        });
    }
  };
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center p-4">
        <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error de Conexión</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!playersByPosition) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Conectando a la base de datos...</div>
      </div>
    );
  }
  
  const allPlayers = players || [];

  return (
    <div className="min-h-screen bg-transparent">
       <AddRatingDialog
        open={isAddRatingDialogOpen}
        onOpenChange={setAddRatingDialogOpen}
        onAddRating={handleAddRating}
        players={allPlayers}
        initialData={dialogInitialData}
      />

      <header className="sticky top-0 z-10 bg-background/70 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-headline text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary))' }}>
            eFootTracker
          </h1>
          <Button onClick={() => handleOpenAddRating({ position: activeTab })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Valoración
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="DC" className="w-full" onValueChange={(value) => setActiveTab(value as Position)}>
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-7 h-auto gap-1 bg-white/5">
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
                (player.cards || [])
                .filter(card => card.ratingsByPosition?.[pos] && card.ratingsByPosition[pos]!.length > 0)
                .map(card => ({ 
                    player, 
                    card,
                    ratingsForPos: card.ratingsByPosition![pos]!
                }))
            ).sort((a, b) => {
              const avgA = calculateAverage(a.ratingsForPos);
              const avgB = calculateAverage(b.ratingsForPos);

              if (avgB !== avgA) {
                return avgB - avgA;
              }

              return b.ratingsForPos.length - a.ratingsForPos.length;
            });

            return (
              <TabsContent key={pos} value={pos} className="mt-6">
                {flatPlayerList.length > 0 ? (
                  <Card className="bg-card/60 border-white/10 overflow-hidden">
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
                        {flatPlayerList.map(({ player, card, ratingsForPos }) => {
                          const cardAverage = calculateAverage(ratingsForPos);
                          const cardMatches = ratingsForPos.length;
                          const cardNameLower = card.name.toLowerCase();
                          
                          const isEuroPotw = cardNameLower.includes("potw european club championship");
                          const isGenericPotw = !isEuroPotw && cardNameLower.includes("potw");
                          const isTsubasa = cardNameLower.includes("captain tsubasa collaboration campaign");
                          const isStartup = cardNameLower.includes("startup campaign");
                          const isSpecialCard = isEuroPotw || isGenericPotw || isTsubasa || isStartup;

                          const rowClasses = cn(
                            "border-b-white/10 transition-colors",
                            isStartup && "bg-startup-blue/10 hover:bg-startup-blue/20",
                            isTsubasa && "bg-tsubasa-blue/10 hover:bg-tsubasa-blue/20",
                            isEuroPotw && "bg-potw-euro/10 hover:bg-potw-euro/20",
                            isGenericPotw && "bg-potw-green/10 hover:bg-potw-green/20",
                            !isSpecialCard && "hover:bg-white/5"
                          );
                          
                          const specialTextClasses = cn({
                              "text-startup-blue font-semibold": isStartup,
                              "text-tsubasa-blue font-semibold": isTsubasa,
                              "text-potw-euro font-semibold": isEuroPotw,
                              "text-potw-green font-semibold": isGenericPotw,
                          });
                          
                          const scoreGlowStyle = isStartup
                            ? { textShadow: '0 0 6px #005BBB' }
                            : isTsubasa
                            ? { textShadow: '0 0 6px #0B1F4D' }
                            : isEuroPotw
                            ? { textShadow: '0 0 6px #E020E0' }
                            : isGenericPotw
                            ? { textShadow: '0 0 6px #39FF14' }
                            : { textShadow: '0 0 8px hsl(var(--primary))' };

                          return (
                             <TableRow key={`${player.id}-${card.id}-${pos}`} className={rowClasses}>
                              <TableCell>
                                <div className="font-medium text-base">{player.name}</div>
                                <div className={cn("text-sm text-muted-foreground", specialTextClasses)}>{card.name}</div>
                              </TableCell>
                              <TableCell>
                                {player.style && player.style !== "Ninguno" ? (
                                  <Badge variant="secondary" className="bg-white/10 text-white/80">{player.style}</Badge>
                                ) : <span className="text-muted-foreground">-</span>}
                              </TableCell>
                              <TableCell>
                                <div className={cn("text-xl font-bold", !isSpecialCard && "text-primary", specialTextClasses)} style={scoreGlowStyle}>
                                  {formatAverage(cardAverage)}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{cardMatches}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap items-center gap-2">
                                  {ratingsForPos.map((rating, index) => (
                                    <div key={index} className="group/rating relative">
                                      <Badge variant="default" className="text-sm bg-primary/80 text-primary-foreground">
                                        {rating.toFixed(1)}
                                      </Badge>
                                      <Button
                                        size="icon" variant="destructive"
                                        className="absolute -top-2 -right-2 h-4 w-4 rounded-full opacity-0 group-hover/rating:opacity-100 transition-opacity z-10"
                                        onClick={() => handleDeleteRating(player.id, card.id, pos, index)}
                                        aria-label={`Eliminar valoración ${rating}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
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
                                          onClick={() => handleOpenAddRating({
                                              playerName: player.name,
                                              cardName: card.name,
                                              position: pos,
                                              style: player.style
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
                                        onClick={() => handleDeleteCard(player.id, card.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Eliminar carta</p></TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center text-center p-10 bg-card/80 rounded-lg shadow-sm border border-dashed border-white/10">
                    <p className="text-lg font-medium text-muted-foreground">Todavía no hay jugadores en la posición de {pos}.</p>
                    <p className="text-sm text-muted-foreground">¡Haz clic en 'Añadir Valoración' para empezar!</p>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
}