
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { EditFormationFormValues } from "@/lib/types";
import { formationPlayStyles } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  playStyle: z.enum(formationPlayStyles),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  secondaryImageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  sourceUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});


type EditFormationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditFormation: (values: EditFormationFormValues) => void;
  initialData?: EditFormationFormValues;
};

export function EditFormationDialog({ open, onOpenChange, onEditFormation, initialData }: EditFormationDialogProps) {
  const form = useForm<EditFormationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      playStyle: "Contraataque rápido",
      imageUrl: "",
      secondaryImageUrl: "",
      sourceUrl: "",
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    }
  }, [open, initialData, form]);

  function onSubmit(values: EditFormationFormValues) {
    onEditFormation(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Formación</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la formación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Formación</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 4-3-3 de Klopp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="playStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de Juego</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo de juego" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {formationPlayStyles.map((style) => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Imagen Principal (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/tactica.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="secondaryImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Imagen Secundaria (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/defensiva.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Origen (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/..." {...field} />
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
