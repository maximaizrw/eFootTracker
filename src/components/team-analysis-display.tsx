
'use client';

import { Lightbulb, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import type { AnalyzeTeamOutput } from '@/ai/flows/analyze-team-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type TeamAnalysisDisplayProps = {
  analysis: AnalyzeTeamOutput | null;
  isLoading: boolean;
};

const AnalysisSection = ({ title, icon, items }: { title: string, icon: React.ReactNode, items: string[] }) => (
  <Card className="bg-card/70 border-white/10">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-3 text-lg text-accent">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" />
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
    <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="bg-card/70 border-white/10">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-accent">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
             <Card className="bg-card/70 border-white/10">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-accent">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                </CardContent>
            </Card>
             <Card className="bg-card/70 border-white/10">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg text-accent">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-6 w-32" />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        </div>
        <Card className="bg-card/70 border-white/10 mt-6">
            <CardHeader className="pb-4">
                 <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
        </Card>
    </div>
);


export function TeamAnalysisDisplay({ analysis, isLoading }: TeamAnalysisDisplayProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }
  
  if (!analysis) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AnalysisSection title="Puntos Fuertes" icon={<ShieldCheck />} items={analysis.strengths} />
        <AnalysisSection title="Debilidades" icon={<ShieldAlert />} items={analysis.weaknesses} />
        <AnalysisSection title="Sugerencias" icon={<Lightbulb />} items={analysis.suggestions} />
      </div>
       <Card className="bg-card/70 border-white/10">
            <CardHeader>
                <CardTitle className="text-xl">Resumen Táctico</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-foreground/90">{analysis.summary}</p>
            </CardContent>
        </Card>
    </div>
  );
}
