"use client";

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, arrayUnion } from 'firebase/firestore';
import Image from 'next/image';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";

import { AddRatingDialog, type FormValues as AddRatingFormValues } from '@/components/add-rating-dialog';
import { EditCardDialog, type FormValues as EditCardFormValues } from '@/components/edit-card-dialog';
import { EditPlayerDialog, type FormValues as EditPlayerFormValues } from '@/components/edit-player-dialog';
import { AddFormationDialog, type AddFormationFormValues } from '@/components/add-formation-dialog';
import { AddMatchDialog, type AddMatchFormValues } from '@/components/add-match-dialog';
import { FormationsDisplay } from '@/components/formations-display';
import { PositionIcon } from '@/components/position-icon';
import type { Player, PlayersByPosition, Position, PlayerCard as PlayerCardType, Formation, IdealTeamPlayer, FormationStats, MatchResult, FlatPlayer } from '@/lib/types';
import { positions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, X, Star, Bot, Download, Search, Trophy } from 'lucide-react';
import { calculateAverage } from '@/lib/utils';
import { IdealTeamDisplay } from '@/components/ideal-team-display';
import { Input } from '@/components/ui/input';
import { PlayerTable } from '@/components/player-table';
import { IdealTeamSetup } from '@/components/ideal-team-setup';


export default function Home() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [formations, setFormations] = useState<FormationStats[]>([]);
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Position | 'ideal-11' | 'formations'>('DC');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddRatingDialogOpen, setAddRatingDialogOpen] = useState(false);
  const [isAddFormationDialogOpen, setAddFormationDialogOpen] = useState(false);
  const [isAddMatchDialogOpen, setAddMatchDialogOpen] = useState(false);
  const [isEditCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setEditPlayerDialogOpen] = useState(false);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [viewingImageName, setViewingImageName] = useState<string | null>(null);
  const [addDialogInitialData, setAddDialogInitialData] = useState<Partial<AddRatingFormValues> | undefined>(undefined);
  const [addMatchInitialData, setAddMatchInitialData] = useState<{ formationId: string; formationName: string } | undefined>(undefined);
  const [editCardDialogInitialData, setEditCardDialogInitialData] = useState<EditCardFormValues | undefined>(undefined);
  const [editPlayerDialogInitialData, setEditPlayerDialogInitialData] = useState<EditPlayerFormValues | undefined>(undefined);
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
    
    const unsubPlayers = onSnapshot(collection(db, "players"), (snapshot) => {
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
        console.error("Error fetching players from Firestore: ", err);
        const errorMessage = "No se pudo conectar a la base de datos para leer jugadores. Comprueba la configuración de Firebase y las reglas de seguridad de Firestore.";
        setError(errorMessage);
        setPlayers([]);
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: errorMessage
        });
    });
    
    const unsubFormations = onSnapshot(collection(db, "formations"), (snapshot) => {
      try {
        const formationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FormationStats));
        setFormations(formationsData);
      } catch (error) {
        console.error("Error processing formations snapshot: ", error);
        toast({
          variant: "destructive",
          title: "Error de Datos",
          description: "No se pudieron procesar los datos de las formaciones.",
        });
      }
    }, (err) => {
        console.error("Error fetching formations from Firestore: ", err);
        toast({
            variant: "destructive",
            title: "Error de Conexión",
            description: "No se pudo conectar a la base de datos para leer formaciones."
        });
    });

    return () => {
      unsubPlayers();
      unsubFormations();
    };
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
  
  const handleOpenAddRating = (initialData?: Partial<AddRatingFormValues>) => {
    setAddDialogInitialData(initialData);
    setAddRatingDialogOpen(true);
  };
  
  const handleOpenEditCard = (player: Player, card: PlayerCardType) => {
    setEditCardDialogInitialData({
        playerId: player.id,
        cardId: card.id,
        currentCardName: card.name,
        currentStyle: card.style,
        imageUrl: card.imageUrl || '',
    });
    setEditCardDialogOpen(true);
  };

  const handleOpenEditPlayer = (player: Player) => {
    setEditPlayerDialogInitialData({
      playerId: player.id,
      currentPlayerName: player.name,
    });
    setEditPlayerDialogOpen(true);
  };

  const handleViewImage = (url: string, name: string) => {
    setViewingImageUrl(url);
    setViewingImageName(name);
    setImageViewerOpen(true);
  };

  const handleAddRating = async (values: AddRatingFormValues) => {
    const { playerId, playerName, cardName, position, rating, style } = values;
    
    try {
      if (playerId) {
        const playerRef = doc(db, 'players', playerId);
        const playerDoc = await getDoc(playerRef);
        
        if (!playerDoc.exists()) {
            throw new Error("Player with given ID not found in DB.");
        }
        
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
          card = { id: uuidv4(), name: cardName, style: style, imageUrl: '', ratingsByPosition: { [position]: [rating] } };
          newCards.push(card);
        }
        
        await updateDoc(playerRef, {
            cards: newCards
        });

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
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo guardar la valoración.",
      });
    }
  };

  const handleAddFormation = async (values: AddFormationFormValues) => {
    try {
      const newFormation: Omit<FormationStats, 'id'> = {
        ...values,
        matches: [],
      };
      await addDoc(collection(db, 'formations'), newFormation);
      toast({ title: "Formación Añadida", description: `La formación "${values.name}" se ha guardado.` });
    } catch (error) {
      console.error("Error adding formation: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: "No se pudo guardar la formación.",
      });
    }
  };
  
  const handleOpenAddMatch = (formationId: string, formationName: string) => {
    setAddMatchInitialData({ formationId, formationName });
    setAddMatchDialogOpen(true);
  };

  const handleAddMatchResult = async (values: AddMatchFormValues) => {
    try {
      const formationRef = doc(db, 'formations', values.formationId);
      const newResult: MatchResult = {
        id: uuidv4(),
        goalsFor: values.goalsFor,
        goalsAgainst: values.goalsAgainst,
        date: new Date().toISOString(),
      };
      await updateDoc(formationRef, {
        matches: arrayUnion(newResult)
      });
      toast({ title: "Resultado Añadido", description: `Marcador ${values.goalsFor} - ${values.goalsAgainst} guardado.` });
    } catch (error) {
      console.error("Error adding match result:", error);
      toast({
        variant: "destructive",
        title: "Error al Registrar",
        description: "No se pudo guardar el resultado del partido.",
      });
    }
  };

  const handleDeleteFormation = async (formationId: string) => {
    try {
      await deleteDoc(doc(db, 'formations', formationId));
      toast({ title: "Formación Eliminada", description: "La formación y sus estadísticas han sido eliminadas." });
    } catch (error) {
      console.error("Error deleting formation:", error);
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar la formación.",
      });
    }
  };

  const handleEditCard = async (values: EditCardFormValues) => {
    if (!players) return;
    const { playerId, cardId, currentCardName, currentStyle, imageUrl } = values;

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const newCards = JSON.parse(JSON.stringify(player.cards)) as PlayerCardType[];
    const cardToUpdate = newCards.find(c => c.id === cardId);

    if (cardToUpdate) {
        cardToUpdate.name = currentCardName;
        cardToUpdate.style = currentStyle;
        cardToUpdate.imageUrl = imageUrl || '';

        try {
            await updateDoc(doc(db, 'players', playerId), { cards: newCards });
            toast({ title: "Carta Actualizada", description: "Los datos de la carta se han actualizado." });
        } catch (error) {
            console.error("Error updating card: ", error);
            toast({
                variant: "destructive",
                title: "Error al Actualizar",
                description: "No se pudieron guardar los cambios de la carta."
            });
        }
    }
  };

  const handleEditPlayer = async (values: EditPlayerFormValues) => {
    const { playerId, currentPlayerName } = values;
    try {
      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        name: currentPlayerName,
      });
      toast({ title: "Jugador Actualizado", description: "El nombre del jugador se ha actualizado." });
    } catch (error) {
      console.error("Error updating player: ", error);
      toast({
        variant: "destructive",
        title: "Error al Actualizar",
        description: "No se pudo guardar el cambio de nombre."
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

    const finalCards = hasRatingsLeft ? newCards.map(c => c.id === cardId ? cardToUpdate : c) : newCards.filter(c => c.id !== cardId);

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
      return {
        player: { id: `placeholder-${position}-${Math.random()}`, name: `Vacante`, cards: [] },
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
      
      const formationsCollection = collection(db, 'formations');
      const formationSnapshot = await getDocs(formationsCollection);
      const formationsData = formationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const backupData = {
        players: playersData,
        formations: formationsData,
      };

      const jsonData = JSON.stringify(backupData, null, 2);
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

  const handleTabChange = (value: string) => {
    setActiveTab(value as Position | 'ideal-11' | 'formations');
    setSearchTerm('');
  };
  
  const getHeaderButton = () => {
    switch(activeTab) {
      case 'formations':
        return (
          <Button onClick={() => setAddFormationDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Formación
          </Button>
        );
      default:
        return (
          <Button onClick={() => handleOpenAddRating(activeTab !== 'ideal-11' ? { position: activeTab as Position } : undefined)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Valoración
          </Button>
        );
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
        initialData={addDialogInitialData}
      />
      <AddFormationDialog
        open={isAddFormationDialogOpen}
        onOpenChange={setAddFormationDialogOpen}
        onAddFormation={handleAddFormation}
      />
      <AddMatchDialog
        open={isAddMatchDialogOpen}
        onOpenChange={setAddMatchDialogOpen}
        onAddMatch={handleAddMatchResult}
        initialData={addMatchInitialData}
      />
      <EditCardDialog
        open={isEditCardDialogOpen}
        onOpenChange={setEditCardDialogOpen}
        onEditCard={handleEditCard}
        initialData={editCardDialogInitialData}
      />
      <EditPlayerDialog
        open={isEditPlayerDialogOpen}
        onOpenChange={setEditPlayerDialogOpen}
        onEditPlayer={handleEditPlayer}
        initialData={editPlayerDialogInitialData}
      />
      <AlertDialog open={isImageViewerOpen} onOpenChange={setImageViewerOpen}>
        <AlertDialogContent className="max-w-xl p-0">
          <AlertDialogHeader className="p-4 border-b">
            <AlertDialogTitle>{viewingImageName}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-4 flex justify-center items-center">
            {viewingImageUrl && (
              <Image
                src={viewingImageUrl}
                alt={viewingImageName || 'Tactic Image'}
                width={500}
                height={500}
                className="object-contain max-h-[80vh]"
              />
            )}
          </div>
          <AlertDialogFooter className="p-4 border-t">
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


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
            {getHeaderButton()}
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <Tabs defaultValue="DC" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 h-auto gap-1 bg-white/5">
            {positions.map((pos) => (
              <TabsTrigger key={pos} value={pos} className="py-2">
                <PositionIcon position={pos} className="mr-2 h-5 w-5"/>
                {pos}
              </TabsTrigger>
            ))}
             <TabsTrigger value="formations" className="py-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Trophy className="mr-2 h-5 w-5"/>
                Formaciones
            </TabsTrigger>
            <TabsTrigger value="ideal-11" className="py-2 data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
                <Star className="mr-2 h-5 w-5"/>
                11 Ideal
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="formations" className="mt-6">
            <FormationsDisplay
              formations={formations}
              onAddMatch={handleOpenAddMatch}
              onDelete={handleDeleteFormation}
              onViewImage={handleViewImage}
            />
          </TabsContent>

          {positions.map((pos) => {
            const playersForPosition = playersByPosition?.[pos] || [];
            
            const flatPlayerList: FlatPlayer[] = playersForPosition.flatMap(player => 
                (player.cards || [])
                .filter(card => card.ratingsByPosition?.[pos] && card.ratingsByPosition[pos]!.length > 0)
                .map(card => ({ 
                    player, 
                    card,
                    ratingsForPos: card.ratingsByPosition![pos]!
                }))
            )
            .filter(({ player }) => player.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
              const avgA = calculateAverage(a.ratingsForPos);
              const avgB = calculateAverage(b.ratingsForPos);

              if (avgB !== avgA) {
                return avgB - avgA;
              }

              return b.ratingsForPos.length - a.ratingsForPos.length;
            });

            return (
              <TabsContent key={pos} value={pos} className="mt-6">
                <Card className="bg-card/60 border-white/10 overflow-hidden">
                    <CardHeader className="p-4 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Buscar en ${pos}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-full md:w-1/3"
                            />
                        </div>
                    </CardHeader>
                    <PlayerTable
                      players={flatPlayerList}
                      position={pos}
                      searchTerm={searchTerm}
                      onOpenAddRating={handleOpenAddRating}
                      onOpenEditCard={handleOpenEditCard}
                      onOpenEditPlayer={handleOpenEditPlayer}
                      onViewImage={handleViewImage}
                      onDeleteCard={handleDeleteCard}
                      onDeleteRating={handleDeleteRating}
                    />
                  </Card>
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
                 <CardDescription>
                   Define tu formación táctica y generaremos el mejor equipo posible basado en el promedio de tus jugadores.
                 </CardDescription>
               </CardHeader>
               <CardContent>
                  <IdealTeamSetup 
                    formation={formation} 
                    onFormationChange={handleFormationChange} 
                  />
                  <Button onClick={handleGenerateTeam} className="mt-6">
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
