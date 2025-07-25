
"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { EditFormationDialog, type EditFormationFormValues } from '@/components/edit-formation-dialog';
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

import type { Player, PlayerCard as PlayerCardType, FormationStats, IdealTeamSlot, FlatPlayer, Position } from '@/lib/types';
import { positions } from '@/lib/types';
import { PlusCircle, Trash2, X, Star, Bot, Download, Search, Trophy, NotebookPen } from 'lucide-react';
import { calculateAverage } from '@/lib/utils';
import { generateIdealTeam } from '@/lib/team-generator';

const ITEMS_PER_PAGE = 10;

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
    editFormation,
    addMatchResult,
    deleteFormation: deleteFormationFromDb,
    deleteMatchResult,
    downloadBackup: downloadFormationsBackup,
  } = useFormations();
  
  const [activeTab, setActiveTab] = useState<string>('DC');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddRatingDialogOpen, setAddRatingDialogOpen] = useState(false);
  const [isAddFormationDialogOpen, setAddFormationDialogOpen] = useState(false);
  const [isEditFormationDialogOpen, setEditFormationDialogOpen] = useState(false);
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
  const [editFormationDialogInitialData, setEditFormationDialogInitialData] = useState<FormationStats | undefined>(undefined);
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);
  
  const [selectedFormationId, setSelectedFormationId] = useState<string | undefined>(undefined);
  const [idealTeam, setIdealTeam] = useState<IdealTeamSlot[]>([]);

  // State for filters and pagination
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [cardFilter, setCardFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<Record<string, number>>({});
  
  const { toast } = useToast();

  useEffect(() => {
    // Select first formation by default if available
    if (!selectedFormationId && formations && formations.length > 0) {
      setSelectedFormationId(formations[0].id);
    }
  }, [formations, selectedFormationId]);


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
  
  const handleOpenEditFormation = (formation: FormationStats) => {
    setEditFormationDialogInitialData(formation);
    setEditFormationDialogOpen(true);
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
    if (!players || !selectedFormationId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, selecciona jugadores y una formación primero.',
      });
      return;
    }

    const formation = formations.find(f => f.id === selectedFormationId);
    if (!formation || !formation.slots) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'La formación seleccionada no es válida.',
      });
      return;
    }
    
    const newTeam = generateIdealTeam(players, formation);

    setIdealTeam(newTeam);
    toast({
      title: "11 Ideal Generado",
      description: `Se ha generado un equipo para la formación "${formation.name}".`,
    });
  };
  
  const handleFormationSelectionChange = (id: string) => {
    setSelectedFormationId(id);
    setIdealTeam([]); // Clear team when formation changes
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
    setActiveTab(value);
    setSearchTerm('');
    setStyleFilter('all');
    setCardFilter('all');
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
      case 'ideal-11':
        return null;
      default:
        return (
          <Button onClick={() => handleOpenAddRating({ position: activeTab as Position })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Valoración
          </Button>
        );
    }
  };
  
  const handlePageChange = (position: Position, direction: 'next' | 'prev') => {
    setPagination(prev => {
      const currentPage = prev[position] || 0;
      const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
      return { ...prev, [position]: Math.max(0, newPage) };
    });
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
      <EditFormationDialog
        open={isEditFormationDialogOpen}
        onOpenChange={setEditFormationDialogOpen}
        onEditFormation={editFormation}
        initialData={editFormationDialogInitialData}
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
        <Tabs defaultValue="DC" className="w-full" onValueChange={handleTabChange} value={activeTab}>
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
              onDeleteFormation={deleteFormationFromDb}
              onEdit={handleOpenEditFormation}
              onViewImage={handleViewImage}
              onDeleteMatchResult={deleteMatchResult}
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
            );
            
            const filteredPlayerList = flatPlayerList.filter(({ player, card }) => {
                const searchMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
                const styleMatch = styleFilter === 'all' || card.style === styleFilter;
                const cardMatch = cardFilter === 'all' || card.name === cardFilter;
                return searchMatch && styleMatch && cardMatch;
            }).sort((a, b) => {
              const avgA = calculateAverage(a.ratingsForPos);
              const avgB = calculateAverage(b.ratingsForPos);

              if (avgB !== avgA) {
                return avgB - avgA;
              }
              return b.ratingsForPos.length - a.ratingsForPos.length;
            });

            const currentPage = pagination[pos] || 0;
            const paginatedPlayers = filteredPlayerList.slice(
              currentPage * ITEMS_PER_PAGE,
              (currentPage + 1) * ITEMS_PER_PAGE
            );
            const totalPages = Math.ceil(filteredPlayerList.length / ITEMS_PER_PAGE);

            const uniqueStyles = ['all', ...Array.from(new Set(flatPlayerList.map(p => p.card.style)))];
            const uniqueCardNames = ['all', ...Array.from(new Set(flatPlayerList.map(p => p.card.name)))];

            return (
              <TabsContent key={pos} value={pos} className="mt-6">
                <Card className="bg-card/60 border-white/10 overflow-hidden">
                    <CardHeader className="p-4 border-b border-white/10">
                       <PlayerTable.Filters
                          searchTerm={searchTerm}
                          onSearchTermChange={setSearchTerm}
                          styleFilter={styleFilter}
                          onStyleFilterChange={setStyleFilter}
                          cardFilter={cardFilter}
                          onCardFilterChange={setCardFilter}
                          uniqueStyles={uniqueStyles}
                          uniqueCardNames={uniqueCardNames}
                          position={pos}
                        />
                    </CardHeader>
                    <PlayerTable
                      players={paginatedPlayers}
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
                    <PlayerTable.Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(direction) => handlePageChange(pos, direction)}
                    />
                  </Card>
              </TabsContent>
            );
          })}
          
          <TabsContent value="ideal-11" className="mt-6">
             <Card className="bg-card/60 border-white/10">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Star className="text-accent"/>
                   Generador de 11 Ideal
                 </CardTitle>
                 <CardDescription>
                   Selecciona una de tus formaciones tácticas y generaremos el mejor equipo posible (titulares y suplentes) basado en el promedio y estilo de tus jugadores.
                 </CardDescription>
               </CardHeader>
               <CardContent>
                  <IdealTeamSetup 
                    formations={formations}
                    selectedFormationId={selectedFormationId}
                    onFormationChange={handleFormationSelectionChange} 
                  />
                  <div className="flex items-center gap-4 mt-6">
                    <Button onClick={handleGenerateTeam} disabled={!selectedFormationId}>
                      <Star className="mr-2 h-4 w-4" />
                      Generar 11 Ideal
                    </Button>
                  </div>
               </CardContent>
             </Card>
            <IdealTeamDisplay teamSlots={idealTeam} />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
