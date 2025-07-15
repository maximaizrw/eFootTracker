
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AddTrainingGuideFormValues } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
});


type AddTrainingGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGuide: (values: AddTrainingGuideFormValues) => void;
};

export function AddTrainingGuideDialog({ open, onOpenChange, onAddGuide }: AddTrainingGuideDialogProps) {
  const form = useForm<AddTrainingGuideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  function onSubmit(values: AddTrainingGuideFormValues) {
    onAddGuide(values);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Guía de Entrenamiento</DialogTitle>
          <DialogDescription>
            Crea una nueva guía. Puedes usar Markdown para formatear el texto (ej: # Título, - Lista, **negrita**).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título de la Guía</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Guía de Entrenamiento para Porteros" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido de la Guía</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe tu guía aquí..."
                      className="min-h-[250px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Guía</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
