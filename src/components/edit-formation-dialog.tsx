
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EditFormationFormValues, FormationStats } from "@/lib/types";
import { formationPlayStyles, positions, playerStyles, FormationSlotSchema } from "@/lib/types";

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  playStyle: z.enum(formationPlayStyles),
  slots: z.array(FormationSlotSchema).length(11, "Debe definir exactamente 11 posiciones."),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  secondaryImageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  sourceUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

const defaultSlots = Array(11).fill({ position: 'DC', style: 'Ninguno' });

type EditFormationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditFormation: (values: EditFormationFormValues) => void;
  initialData?: FormationStats;
};

export function EditFormationDialog({ open, onOpenChange, onEditFormation, initialData }: EditFormationDialogProps) {
  const form = useForm<EditFormationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      playStyle: "Contraataque rápido",
      slots: defaultSlots,
      imageUrl: "",
      secondaryImageUrl: "",
      sourceUrl: "",
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "slots",
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        playStyle: initialData.playStyle,
        slots: initialData.slots && initialData.slots.length === 11 ? initialData.slots : defaultSlots,
        imageUrl: initialData.imageUrl || "",
        secondaryImageUrl: initialData.secondaryImageUrl || "",
        sourceUrl: initialData.sourceUrl || "",
      });
    }
  }, [open, initialData, form]);

  function onSubmit(values: EditFormationFormValues) {
    onEditFormation(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Formación Táctica</DialogTitle>
          <DialogDescription>
            Modifica la plantilla, especificando posición y estilo de juego para cada puesto.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <FormLabel>Estilo de Juego Global</FormLabel>
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
            </div>

            <ScrollArea className="h-72 w-full rounded-md border p-4">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end p-2 border-b">
                    <p className="font-medium md:col-span-1">Jugador {index + 1}</p>
                    <FormField
                      control={form.control}
                      name={`slots.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posición</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {positions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`slots.${index}.style`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estilo de Juego</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {playerStyles.map(style => <SelectItem key={style} value={style}>{style}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    