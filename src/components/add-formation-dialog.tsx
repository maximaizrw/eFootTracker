
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
  FormDescription,
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
import type { AddFormationFormValues } from "@/lib/types";
import { formationPlayStyles } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  playStyle: z.enum(formationPlayStyles),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  secondaryImageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  sourceUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});


type AddFormationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFormation: (values: AddFormationFormValues) => void;
};

export function AddFormationDialog({ open, onOpenChange, onAddFormation }: AddFormationDialogProps) {
  const form = useForm<AddFormationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      playStyle: "Contraataque rápido",
      imageUrl: "",
      secondaryImageUrl: "",
      sourceUrl: "",
    },
  });

  function onSubmit(values: AddFormationFormValues) {
    onAddFormation(values);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Formación</DialogTitle>
          <DialogDescription>
            Introduce los detalles de la nueva formación para empezar a registrar su rendimiento.
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
                  <FormLabel>URL de Imagen Principal (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/tactica.png" {...field} />
                  </FormControl>
                   <FormDescription>Pega la URL de la táctica principal.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryImageUrl"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>URL de Imagen Secundaria (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="https://ejemplo.com/tactica_def.png" {...field} />
                    </FormControl>
                    <FormDescription>Pega la URL de la táctica defensiva u ofensiva.</FormDescription>
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
              <Button type="submit">Guardar Formación</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
