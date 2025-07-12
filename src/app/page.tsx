"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AddRatingDialog, type FormValues } from '@/components/add-rating-dialog';
import { PositionIcon } from '@/components/position-icon';
import type { Player, PlayersByPosition, Position, PlayerCard as PlayerCardType, Formation, IdealTeamPlayer } from '@/lib/types';
import { positions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, X, Star, Bot, Download } from 'lucide-react';
import { calculateAverage, cn, formatAverage } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IdealTeamDisplay } from '@/components/ideal-team-display';

export default function Home() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Position | 'ideal-11'>('DC');
  const [isAddRatingDialogOpen, setAddRatingDialogOpen] = useState(false);
  const [dialogInitialData, setDialogInitialData] = useState<Partial<FormValues> | undefined>(undefined);
  const [formation, setFormation] = useState<Formation>({
    PT: 1, DFC: 3, LI: 0, LD: 1, MCD: 1, MC: 1, MDI: 0, MDD: 0, MO: 3, EXI: 0, EXD: 0, SD: 0, DC: 1
  });
  const [idealTeam, setIdealTeam] = useState<(IdealTeamPlayer | null)[]>([]);
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
                cards: (data.cards || []).map((card: any) => ({
                    ...card,
                    style: card.style || 'Ninguno',
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
          card = { id: uuidv4(), name: cardName, style: style, ratingsByPosition: { [position]: [rating] } };
          newCards.push(card);
        }
        
        await updateDoc(playerRef, {
            cards: newCards
        });

      } else {
        const newPlayer = {
          name: playerName,
          cards: [{ id: uuidv4(), name: cardName, style: style, ratingsByPosition: { [position]: [rating] } }],
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

  const handleDeleteCard = async (playerId: string, cardId: string, position: Position) => {
    if (!players) return;
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCards: PlayerCardType[] = JSON.parse(JSON.stringify(player.cards));
    const cardToUpdate = newCards.find(c => c.id === cardId);

    if (!cardToUpdate || !cardToUpdate.ratingsByPosition || !cardToUpdate.ratingsByPosition[position]) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se encontraron valoraciones para esta posición.",
        });
        return;
    }
    
    delete cardToUpdate.ratingsByPosition[position];

    const hasRatingsLeft = Object.keys(cardToUpdate.ratingsByPosition).length > 0;

    const finalCards = hasRatingsLeft ? newCards : newCards.filter(c => c.id !== cardId);

    try {
        await updateDoc(doc(db, 'players', playerId), { cards: finalCards });
        toast({ title: "Acción Completada", description: `Se eliminaron las valoraciones de ${player.name} para la posición ${position}.` });
    } catch (error) {
        console.error("Error deleting position ratings from card: ", error);
        toast({
            variant: "destructive",
            title: "Error al Eliminar",
            description: "No se pudo completar la acción."
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

  const handleGenerateTeam = () => {
    if (!players) return;

    const allRatedPlayers: IdealTeamPlayer[] = players.flatMap(player =>
        (player.cards || []).flatMap(card =>
            Object.keys(card.ratingsByPosition || {}).map(posStr => {
                const position = posStr as Position;
                const ratings = card.ratingsByPosition![position];
                if (!ratings || ratings.length === 0) return null;
                return {
                    player,
                    card,
                    position,
                    average: calculateAverage(ratings),
                };
            }).filter((p): p is IdealTeamPlayer => p !== null)
        )
    ).sort((a, b) => b.average - a.average);

    const usedCardIds = new Set<string>();
    const requiredSlots: Position[] = [];
    let totalPlayers = 0;

    (Object.keys(formation) as Position[]).forEach(pos => {
      const count = formation[pos] ?? 0;
      totalPlayers += count;
      for (let i = 0; i < count; i++) {
        requiredSlots.push(pos);
      }
    });

    if (totalPlayers === 0) {
      toast({
        variant: "destructive",
        title: "Formación Vacía",
        description: "Por favor, selecciona al menos un jugador en la formación.",
      });
      return;
    }

    const newTeam: (IdealTeamPlayer | null)[] = requiredSlots.map(position => {
      const bestPlayerForSlot = allRatedPlayers.find(
        p => p.position === position && !usedCardIds.has(p.card.id)
      );

      if (bestPlayerForSlot) {
        usedCardIds.add(bestPlayerForSlot.card.id);
        return bestPlayerForSlot;
      }
      // Return a placeholder if no player is found for the slot
      return {
        player: { id: `placeholder-${position}-${Math.random()}`, name: `Vacante (${position})`, cards: [] },
        card: { id: `placeholder-card-${position}-${Math.random()}`, name: 'N/A', style: 'Ninguno', ratingsByPosition: {} },
        position: position,
        average: 0,
      };
    });

    setIdealTeam(newTeam);
    toast({
      title: "11 Ideal Generado",
      description: `Se ha generado un equipo con ${newTeam.filter(p => p && !p.player.id.startsWith('placeholder')).length} de ${totalPlayers} jugadores.`,
    });
  };

  const handleFormationChange = (position: Position, value: string) => {
    const count = parseInt(value, 10);
    setFormation(prev => ({ ...prev, [position]: count }));
  };
  
    const handleDownloadBackup = async () => {
    if (!db) {
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudo conectar a la base de datos.",
      });
      return;
    }

    try {
      const playersCollection = collection(db, 'players');
      const playerSnapshot = await getDocs(playersCollection);
      const playersData = playerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const jsonData = JSON.stringify(playersData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'eFootTracker_backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga Iniciada",
        description: "El backup de la base de datos se está descargando.",
      });

    } catch (error) {
      console.error("Error downloading backup: ", error);
      toast({
        variant: "destructive",
        title: "Error en la Descarga",
        description: "No se pudo generar el archivo de backup.",
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
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadBackup} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar Backup
            </Button>
            <Button onClick={() => handleOpenAddRating(activeTab !== 'ideal-11' ? { position: activeTab } : undefined)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Valoración
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="DC" className="w-full" onValueChange={(value) => setActiveTab(value as Position | 'ideal-11')}>
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-7 h-auto gap-1 bg-white/5">
            {positions.map((pos) => (
              <TabsTrigger key={pos} value={pos} className="py-2">
                <PositionIcon position={pos} className="mr-2 h-5 w-5"/>
                {pos}
              </TabsTrigger>
            ))}
            <TabsTrigger value="ideal-11" className="py-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Star className="mr-2 h-5 w-5"/>
                11 Ideal
            </TabsTrigger>
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
                          const isAtalanta = cardNameLower.includes("atalanta bc 96-97");
                          const isSpecialCard = isEuroPotw || isGenericPotw || isTsubasa || isStartup || isAtalanta;

                          const rowClasses = cn(
                            "border-b-white/10 transition-colors",
                            isStartup && "bg-startup-blue/10 hover:bg-startup-blue/20",
                            isTsubasa && "bg-tsubasa-blue/10 hover:bg-tsubasa-blue/20",
                            isEuroPotw && "bg-potw-euro/10 hover:bg-potw-euro/20",
                            isGenericPotw && "bg-potw-green/10 hover:bg-potw-green/20",
                            isAtalanta && "bg-atalanta-green/10 hover:bg-atalanta-green/20",
                            !isSpecialCard && "hover:bg-white/5"
                          );
                          
                          const specialTextClasses = cn({
                              "text-startup-blue font-semibold": isStartup,
                              "text-tsubasa-blue font-semibold": isTsubasa,
                              "text-potw-euro font-semibold": isEuroPotw,
                              "text-potw-green font-semibold": isGenericPotw,
                              "text-atalanta-green font-semibold": isAtalanta,
                          });
                          
                          const scoreGlowStyle = isStartup
                            ? { textShadow: '0 0 6px #005BBB' }
                            : isTsubasa
                            ? { textShadow: '0 0 6px #0B1F4D' }
                            : isEuroPotw
                            ? { textShadow: '0 0 6px #E020E0' }
                            : isGenericPotw
                            ? { textShadow: '0 0 6px #39FF14' }
                            : isAtalanta
                            ? { textShadow: '0 0 6px #2CFF05' }
                            : { textShadow: '0 0 8px hsl(var(--primary))' };

                          return (
                             <TableRow key={`${player.id}-${card.id}-${pos}`} className={rowClasses}>
                              <TableCell>
                                <div className="font-medium text-base">{player.name}</div>
                                <div className={cn("text-sm text-muted-foreground", specialTextClasses)}>{card.name}</div>
                              </TableCell>
                              <TableCell>
                                {card.style && card.style !== "Ninguno" ? (
                                  <Badge variant="secondary" className="bg-white/10 text-white/80">{card.style}</Badge>
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
                                            onClick={() => handleDeleteRating(player.id, card.id, pos, originalIndex)}
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
                                          onClick={() => handleOpenAddRating({
                                              playerName: player.name,
                                              cardName: card.name,
                                              position: pos,
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
                                        aria-label={`Eliminar valoraciones de ${card.name} (${player.name}) para la posición ${pos}`}
                                        onClick={() => handleDeleteCard(player.id, card.id, pos)}>
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
          
          <TabsContent value="ideal-11" className="mt-6">
            <Card className="bg-card/60 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="text-accent"/>
                  Generador de 11 Ideal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">Define tu formación táctica y generaremos el mejor equipo posible basado en el promedio de tus jugadores.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6 p-4 border border-dashed border-white/10 rounded-lg">
                  {positions.map(pos => (
                    <div key={pos} className="flex flex-col gap-2">
                       <label className="text-sm font-medium flex items-center gap-2">
                          <PositionIcon position={pos} className="h-4 w-4 text-primary"/>
                          {pos}
                        </label>
                      <Select
                        value={(formation[pos] ?? 0).toString()}
                        onValueChange={(value) => handleFormationChange(pos, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <Button onClick={handleGenerateTeam}>
                  <Star className="mr-2 h-4 w-4" />
                  Generar 11 Ideal
                </Button>
              </CardContent>
            </Card>
            <IdealTeamDisplay team={idealTeam} />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
