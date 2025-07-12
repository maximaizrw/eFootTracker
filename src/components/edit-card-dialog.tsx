"use client";

import { useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlayerStyle, Position } from "@/lib/types";
import { playerStyles } from "@/lib/types";

const formSchema = z.object({
  playerId: z.string(),
  cardId: z.string(),
  position: z.enum(['PT', 'DFC', 'LI', 'LD', 'MCD', 'MC', 'MDI', 'MDD', 'MO', 'EXI', 'EXD', 'SD', 'DC']),
  currentCardName: z.string().min(2, "El nombre de la carta debe tener al menos 2 caracteres."),
  currentStyle: z.enum(playerStyles),
});

export type FormValues = z.infer<typeof formSchema>;

type EditCardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditCard: (values: FormValues) => void;
  initialData?: FormValues;
};

export function EditCardDialog({ open, onOpenChange, onEditCard, initialData }: EditCardDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const positionValue = form.watch('position');

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    }
  }, [open, initialData, form]);
  
  const availableStyles = useMemo(() => {
    if (!positionValue) return playerStyles as unknown as PlayerStyle[];

    const gkStyles: PlayerStyle[] = ['Ninguno', 'Portero defensivo', 'Portero ofensivo'];
    const fbStyles: PlayerStyle[] = ['Ninguno', 'Lateral defensivo', 'Lateral Ofensivo', 'Lateral finalizador'];
    const dfcStyles: PlayerStyle[] = ['Ninguno', 'El destructor', 'Creador de juego', 'Atacante extra'];
    const mcdStyles: PlayerStyle[] = ['Ninguno', 'Omnipresente', 'Medio escudo', 'Organizador', 'El destructor'];
    const mcStyles: PlayerStyle[] = ['Ninguno', 'Jugador de huecos', 'Omnipresente', 'Medio escudo', 'El destructor', 'Organizador', 'Creador de jugadas'];
    const mdiMddStyles: PlayerStyle[] = ['Ninguno', 'Omnipresente', 'Jugador de huecos', 'Especialista en centros', 'Extremo móvil', 'Creador de jugadas'];
    const moStyles: PlayerStyle[] = ['Ninguno', 'Creador de jugadas', 'Diez Clasico', 'Jugador de huecos', 'Señuelo'];
    const sdStyles: PlayerStyle[] = ['Ninguno', 'Segundo delantero', 'Creador de jugadas', 'Diez Clasico', 'Jugador de huecos', 'Señuelo'];
    const wingerStyles: PlayerStyle[] = ['Ninguno', 'Creador de jugadas', 'Extremo prolífico', 'Extremo móvil', 'Especialista en centros'];
    const dcStyles: PlayerStyle[] = ['Ninguno', 'Cazagoles', 'Señuelo', 'Hombre de área', 'Hombre objetivo', 'Segundo delantero'];

    if (positionValue === 'PT') return gkStyles;
    if (positionValue === 'LI' || positionValue === 'LD') return fbStyles;
    if (positionValue === 'DFC') return dfcStyles;
    if (positionValue === 'MCD') return mcdStyles;
    if (positionValue === 'MC') return mcStyles;
    if (positionValue === 'MDI' || positionValue === 'MDD') return mdiMddStyles;
    if (positionValue === 'MO') return moStyles;
    if (positionValue === 'SD') return sdStyles;
    if (positionValue === 'EXI' || positionValue === 'EXD') return wingerStyles;
    if (positionValue === 'DC') return dcStyles;
    
    return playerStyles as unknown as PlayerStyle[];
  }, [positionValue]);

  useEffect(() => {
    const currentStyle = form.getValues('currentStyle');
    if (!availableStyles.includes(currentStyle)) {
      form.setValue('currentStyle', 'Ninguno', { shouldValidate: true });
    }
  }, [positionValue, form, availableStyles]);

  function onSubmit(values: FormValues) {
    onEditCard(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Carta</DialogTitle>
          <DialogDescription>
            Modifica el nombre y el estilo de juego de la carta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentCardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Carta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: POTW, Highlight..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de Juego</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStyles.map((style) => (
                        <SelectItem key={style} value={style}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
