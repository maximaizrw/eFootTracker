
"use client";

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AddRatingDialog, type FormValues as AddRatingFormValues } from '@/components/add-rating-dialog';
import { EditCardDialog, type FormValues as EditCardFormValues } from '@/components/edit-card-dialog';
import { EditPlayerDialog, type FormValues as EditPlayerFormValues } from '@/components/edit-player-dialog';
import { AddFormationDialog, type AddFormationFormValues } from '@/components/add-formation-dialog';
import { AddMatchDialog, type AddMatchFormValues } from '@/components/add-match-dialog';
import { PlayerDetailDialog } from '@/components/player-detail-dialog';

import { FormationsDisplay } from '@/components/formations-display';
import { IdealTeamDisplay } from '@/components/ideal-team-display';
import { IdealTeamSetup } from '@/components/ideal-team-setup';
import { PlayerTable } from '@/components/player-table';
import { PositionIcon } from '@/components/position-icon';

import { usePlayers } from '@/hooks/usePlayers';
import { useFormations } from '@/hooks/useFormations';
import { useToast } from "@/hooks/use-toast";

import type { Player, PlayersByPosition, Position, PlayerCard as PlayerCardType, Formation, IdealTeamPlayer, FlatPlayer } from '@/lib/types';
import { positions } from '@/lib/types';
import { PlusCircle, Trash2, X, Star, Bot, Download, Search, Trophy } from 'lucide-react';
import { calculateAverage } from '@/lib/utils';


export default function Home() {
  const { 
    players, 
    playersByPosition, 
    loading: playersLoading, 
    error: playersError, 
    addRating,
    editCard,
    editPlayer,
    deletePlayer,
    deleteCard,
    deleteRating,
    downloadBackup: downloadPlayersBackup,
  } = usePlayers();

  const {
    formations,
    loading: formationsLoading,
    error: formationsError,
    addFormation,
    addMatchResult,
    deleteFormation,
    downloadBackup: downloadFormationsBackup,
  } = useFormations();

  const [activeTab, setActiveTab] = useState<Position | 'ideal-11' | 'formations'>('DC');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddRatingDialogOpen, setAddRatingDialogOpen] = useState(false);
  const [isAddFormationDialogOpen, setAddFormationDialogOpen] = useState(false);
  const [isAddMatchDialogOpen, setAddMatchDialogOpen] = useState(false);
  const [isEditCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [isEditPlayerDialogOpen, setEditPlayerDialogOpen] = useState(false);
  const [isPlayerDetailDialogOpen, setPlayerDetailDialogOpen] = useState(false);
  const [isImageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);
  const [viewingImageName, setViewingImageName] = useState<string | null>(null);
  const [addDialogInitialData, setAddDialogInitialData] = useState<Partial<AddRatingFormValues> | undefined>(undefined);
  const [addMatchInitialData, setAddMatchInitialData] = useState<{ formationId: string; formationName: string } | undefined>(undefined);
  const [editCardDialogInitialData, setEditCardDialogInitialData] = useState<EditCardFormValues | undefined>(undefined);
  const [editPlayerDialogInitialData, setEditPlayerDialogInitialData] = useState<EditPlayerFormValues | undefined>(undefined);
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);
  
  const [formation, setFormation] = useState<Formation>({
    PT: 1, DFC: 3, LI: 0, LD: 1, MCD: 1, MC: 1, MDI: 0, MDD: 0, MO: 3, EXI: 0, EXD: 0, SD: 0, DC: 1
  });
  const [idealTeam, setIdealTeam] = useState<(IdealTeamPlayer | null)[]>([]);
  const { toast } = useToast();
  
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

  const handleOpenPlayerDetail = (player: Player) => {
    setSelectedPlayerForDetail(player);
    setPlayerDetailDialogOpen(true);
  };

  const handleViewImage = (url: string, name: string) => {
    setViewingImageUrl(url);
    setViewingImageName(name);
    setImageViewerOpen(true);
  };

  const handleOpenAddMatch = (formationId: string, formationName: string) => {
    setAddMatchInitialData({ formationId, formationName });
    setAddMatchDialogOpen(true);
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
    const playersData = await downloadPlayersBackup();
    const formationsData = await downloadFormationsBackup();
    
    if (!playersData || !formationsData) {
       toast({
        variant: "destructive",
        title: "Error en la Descarga",
        description: "No se pudo generar el archivo de backup.",
      });
      return;
    }
    
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

  const error = playersError || formationsError;
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

  if (playersLoading || formationsLoading) {
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
        onAddRating={addRating}
        players={allPlayers}
        initialData={addDialogInitialData}
      />
      <AddFormationDialog
        open={isAddFormationDialogOpen}
        onOpenChange={setAddFormationDialogOpen}
        onAddFormation={addFormation}
      />
      <AddMatchDialog
        open={isAddMatchDialogOpen}
        onOpenChange={setAddMatchDialogOpen}
        onAddMatch={addMatchResult}
        initialData={addMatchInitialData}
      />
      <EditCardDialog
        open={isEditCardDialogOpen}
        onOpenChange={setEditCardDialogOpen}
        onEditCard={editCard}
        initialData={editCardDialogInitialData}
      />
      <EditPlayerDialog
        open={isEditPlayerDialogOpen}
        onOpenChange={setEditPlayerDialogOpen}
        onEditPlayer={editPlayer}
        initialData={editPlayerDialogInitialData}
      />
      <PlayerDetailDialog
        open={isPlayerDetailDialogOpen}
        onOpenChange={setPlayerDetailDialogOpen}
        player={selectedPlayerForDetail}
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
              onDelete={deleteFormation}
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
                      onOpenPlayerDetail={handleOpenPlayerDetail}
                      onViewImage={handleViewImage}
                      onDeletePlayer={deletePlayer}
                      onDeleteCard={deleteCard}
                      onDeleteRating={deleteRating}
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
