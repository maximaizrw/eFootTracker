
"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LabelList } from 'recharts';
import type { Player, Position, PlayerCard as PlayerCardType, TrainingBuild, TrainingAttribute, FlatPlayer } from "@/lib/types";
import { trainingAttributes } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { formatAverage, getPositionGroupColor, normalizeText } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

type PlayerDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flatPlayer: FlatPlayer | null;
  onSaveTrainingBuild: (playerId: string, cardId: string, position: Position, build: TrainingBuild) => void;
};

type PerformanceData = {
  position: Position;
  average: number;
  matches: number;
};

const TrainingBuildEditor = ({ build: initialBuild, onSave, onCancel }: { build: TrainingBuild, onSave: (newBuild: TrainingBuild) => void, onCancel: () => void }) => {
    const [build, setBuild] = React.useState<TrainingBuild>(initialBuild);
    const { toast } = useToast();

    const handleSliderChange = (attribute: TrainingAttribute, value: number) => {
        setBuild(prev => ({ ...prev, [attribute]: value }));
    };
    
    const totalPoints = Object.values(build).reduce((sum, val) => sum + (val || 0), 0);
    
    const handleSave = () => {
        onSave(build);
        toast({ title: "Build Guardada", description: "La progresión de entrenamiento se ha guardado." });
    };

    return (
        <div className="space-y-4 pt-4">
            {trainingAttributes.map(attr => (
                <div key={attr} className="space-y-2">
                    <div className="flex justify-between items-center">
                       <Label htmlFor={attr} className="capitalize">{normalizeText(attr).replace(/_/g, ' ')}</Label>
                       <span className="text-sm font-bold w-6 text-center rounded bg-primary/20 text-primary">{build[attr] || 0}</span>
                    </div>
                    <Slider
                        id={attr}
                        min={0}
                        max={18}
                        step={1}
                        value={[build[attr] || 0]}
                        onValueChange={(value) => handleSliderChange(attr, value[0])}
                    />
                </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t border-border">
                <p className="text-sm font-medium">Puntos Totales: <span className="text-accent font-bold">{totalPoints}</span></p>
                <div className="flex gap-2">
                    <Button onClick={onCancel} variant="outline">Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Build</Button>
                </div>
            </div>
        </div>
    );
};


export function PlayerDetailDialog({ open, onOpenChange, flatPlayer, onSaveTrainingBuild }: PlayerDetailDialogProps) {
  const [selectedPosition, setSelectedPosition] = React.useState<Position | undefined>();
  const [isEditingBuild, setIsEditingBuild] = React.useState(false);
  
  const { toast } = useToast();
  
  // Reset state when dialog opens or player changes
  React.useEffect(() => {
    if (open && flatPlayer) {
      const card = flatPlayer.card;
      // When a flat player is passed, it relates to a specific position from the table.
      // We should default to that position.
      setSelectedPosition(flatPlayer.performance.stats.matches > 0 ? flatPlayer.ratingsForPos.length > 0 ? (flatPlayer as any).position : Object.keys(card.ratingsByPosition || {})[0] as Position | undefined : undefined);
    } else {
      setSelectedPosition(undefined);
    }
    setIsEditingBuild(false);
  }, [open, flatPlayer]);

  const performanceData = React.useMemo(() => {
    if (!flatPlayer) return [];
    
    const performanceMap = new Map<Position, { total: number; count: number }>();

    // We only care about the ratings from the specific card we are viewing
    const card = flatPlayer.card;
    if (card && card.ratingsByPosition) {
        for (const pos in card.ratingsByPosition) {
            const position = pos as Position;
            const ratings = card.ratingsByPosition[position];
            if (ratings && ratings.length > 0) {
                const sum = ratings.reduce((a, b) => a + b, 0);
                const current = performanceMap.get(position) || { total: 0, count: 0 };
                performanceMap.set(position, {
                    total: current.total + sum,
                    count: current.count + ratings.length,
                });
            }
        }
    }

    return Array.from(performanceMap.entries()).map(([position, data]) => ({
      position,
      average: parseFloat(formatAverage(data.total / data.count)),
      matches: data.count,
    })).sort((a, b) => b.average - a.average);
    
  }, [flatPlayer]);

  const card = flatPlayer?.card;
  const player = flatPlayer?.player;
  const currentBuild = (card && selectedPosition && card.trainingBuilds?.[selectedPosition]) || {};
  const availablePositions = Array.from(new Set(card?.ratingsByPosition ? Object.keys(card.ratingsByPosition) : [])) as Position[];

  React.useEffect(() => {
      if (availablePositions.length > 0 && !selectedPosition) {
          setSelectedPosition(availablePositions[0]);
      }
  }, [availablePositions, selectedPosition]);


  const handleSave = (newBuild: TrainingBuild) => {
    if (player && card && selectedPosition) {
      onSaveTrainingBuild(player.id, card.id, selectedPosition, newBuild);
      setIsEditingBuild(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setIsEditingBuild(false); }}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Estadísticas de {player?.name} <span className="text-muted-foreground">({card?.name})</span></DialogTitle>
          <DialogDescription>
            Análisis detallado del rendimiento y la progresión de entrenamiento del jugador para esta carta.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[70vh] overflow-y-auto pr-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Posición</CardTitle>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                      <BarChart data={performanceData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="position" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                        <Tooltip
                            contentStyle={{ 
                                background: "hsl(var(--background))", 
                                borderColor: "hsl(var(--border))" 
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(value, name, props) => [`${value} (${props.payload.matches} partidos)`, "Promedio"]}
                        />
                        <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                           {performanceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getPositionGroupColor(entry.position)} />
                            ))}
                            <LabelList dataKey="average" position="top" formatter={(value: number) => formatAverage(value)} className="fill-foreground font-semibold" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay valoraciones para esta carta.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Build de Entrenamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availablePositions.length > 0 ? (
                  <>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Posición de la Build</Label>
                      <Select value={selectedPosition} onValueChange={(v) => setSelectedPosition(v as Position)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una posición" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePositions.map(pos => (
                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isEditingBuild ? (
                    <TrainingBuildEditor
                        build={currentBuild}
                        onSave={handleSave}
                        onCancel={() => setIsEditingBuild(false)}
                      />
                  ) : (
                    <div className="space-y-2 pt-4">
                      {trainingAttributes.map(attr => (
                          <div key={attr} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground capitalize">{normalizeText(attr).replace(/_/g, ' ')}</span>
                              <span className="font-bold">{currentBuild[attr] || 0}</span>
                          </div>
                      ))}
                      <div className="flex justify-end pt-4">
                        <Button onClick={() => setIsEditingBuild(true)} disabled={!selectedPosition}>Editar Build</Button>
                      </div>
                    </div>
                  )}
                  </>
                ) : (
                  <p className="text-muted-foreground pt-4">No hay posiciones con valoraciones para definir una build.</p>
                )}
              </CardContent>
            </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
}
