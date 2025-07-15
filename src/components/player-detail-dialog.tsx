
"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { Player, Position } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calculateAverage, formatAverage, getPositionGroupColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

type PlayerDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
};

type PerformanceData = {
  position: Position;
  average: number;
  matches: number;
};

export function PlayerDetailDialog({ open, onOpenChange, player }: PlayerDetailDialogProps) {
  const performanceData = React.useMemo(() => {
    if (!player) return [];
    
    const performanceMap = new Map<Position, { total: number; count: number }>();
    
    player.cards.forEach(card => {
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
    });

    return Array.from(performanceMap.entries()).map(([position, data]) => ({
      position,
      average: parseFloat(formatAverage(data.total / data.count)),
      matches: data.count,
    })).sort((a, b) => b.average - a.average);
    
  }, [player]);
  
  const mostUsedCards = React.useMemo(() => {
    if (!player) return [];
    
    const cardUsage = player.cards.map(card => {
        const matches = Object.values(card.ratingsByPosition || {}).reduce((sum, ratings) => sum + (ratings?.length || 0), 0);
        return { name: card.name, matches, style: card.style };
    }).filter(c => c.matches > 0);

    return cardUsage.sort((a, b) => b.matches - a.matches).slice(0, 5);

  }, [player]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Estadísticas de {player?.name}</DialogTitle>
          <DialogDescription>
            Análisis detallado del rendimiento del jugador en diferentes posiciones y con distintas cartas.
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
                      <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                        <YAxis type="category" dataKey="position" width={50} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                            contentStyle={{ 
                                background: "hsl(var(--background))", 
                                borderColor: "hsl(var(--border))" 
                            }}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            formatter={(value, name, props) => [`${value} (${props.payload.matches} partidos)`, "Promedio"]}
                        />
                        <Bar dataKey="average" barSize={20}>
                           {performanceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getPositionGroupColor(entry.position)} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay suficientes datos para mostrar el gráfico.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cartas Más Usadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {mostUsedCards.length > 0 ? (
                    mostUsedCards.map(card => (
                        <div key={card.name} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                            <div>
                                <p className="font-semibold">{card.name}</p>
                                <p className="text-xs text-muted-foreground">{card.style}</p>
                            </div>
                            <Badge variant="secondary">{card.matches} Partidos</Badge>
                        </div>
                    ))
                 ) : (
                    <p className="text-muted-foreground">No hay datos de uso de cartas.</p>
                 )}
              </CardContent>
            </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
}
