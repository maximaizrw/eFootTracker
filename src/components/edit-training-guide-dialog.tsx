
"use client";

import { useEffect } from "react";
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
import type { EditTrainingGuideFormValues } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
});


type EditTrainingGuideDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditGuide: (values: EditTrainingGuideFormValues) => void;
  initialData?: EditTrainingGuideFormValues;
};

export function EditTrainingGuideDialog({ open, onOpenChange, onEditGuide, initialData }: EditTrainingGuideDialogProps) {
  const form = useForm<EditTrainingGuideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    }
  }, [open, initialData, form]);

  function onSubmit(values: EditTrainingGuideFormValues) {
    onEditGuide(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Guía de Entrenamiento</DialogTitle>
          <DialogDescription>
            Modifica el contenido de la guía. Puedes usar Markdown (ej: # Título, - Lista, **negrita**).
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
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    