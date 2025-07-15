
"use client";

import type { TrainingGuide } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, NotebookPen, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// A simple markdown parser
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="prose prose-sm prose-invert max-w-none text-foreground/90">
      {lines.map((line, index) => {
        if (line.startsWith('# ')) {
          return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-primary">{line.substring(2)}</h2>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={index} className="text-lg font-semibold mt-3 mb-1">{line.substring(3)}</h3>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        if (line.match(/\*\*(.*?)\*\*/g)) {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={index}>
                {parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="text-accent">{part}</strong> : part))}
              </p>
            );
        }
        return <p key={index}>{line || <br />}</p>;
      })}
    </div>
  );
};


type TrainingGuideDisplayProps = {
  guides: TrainingGuide[];
  onEdit: (guide: TrainingGuide) => void;
  onDelete: (guideId: string) => void;
};

export function TrainingGuideDisplay({ guides, onEdit, onDelete }: TrainingGuideDisplayProps) {
  if (guides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-card/80 rounded-lg shadow-sm border border-dashed border-white/10">
        <NotebookPen className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Todavía no has añadido ninguna guía.</p>
        <p className="text-sm text-muted-foreground">Haz clic en 'Añadir Guía' para crear la primera.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {guides.map((guide) => {
        return (
          <Card key={guide.id} className="bg-card/60 border-white/10 flex flex-col">
            <CardHeader className="p-4 border-b border-white/10">
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{guide.title}</CardTitle>
                    <CardDescription>
                      Creado el {new Date(guide.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <SimpleMarkdown content={guide.content} />
            </CardContent>
            <CardFooter className="p-4 border-t border-white/10 flex justify-end gap-2">
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => onEdit(guide)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Editar Guía</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={() => onDelete(guide.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Eliminar Guía</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

    