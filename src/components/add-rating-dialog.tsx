"use client";

import { useState, useEffect } from "react";
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
  DialogTrigger,
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
import { Slider } from "@/components/ui/slider";
import { PlusCircle } from 'lucide-react';
import type { Player } from "@/lib/types";
import { positions, playerStyles } from "@/lib/types";

const formSchema = z.object({
  playerName: z.string().min(2, "El nombre del jugador debe tener al menos 2 caracteres."),
  cardName: z.string().min(2, "El nombre de la carta debe tener al menos 2 caracteres."),
  position: z.enum(positions),
  style: z.enum(playerStyles),
  rating: z.number().min(1).max(10),
});

export type FormValues = z.infer<typeof formSchema>;

type AddRatingDialogProps = {
  onAddRating: (values: FormValues) => void;
  players: Player[];
};

export function AddRatingDialog({ onAddRating, players }: AddRatingDialogProps) {
  const [open, setOpen] = useState(false);
  const [cardNames, setCardNames] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      cardName: "Carta Base",
      position: "DC",
      style: "Ninguno",
      rating: 5,
    },
  });

  const playerNameValue = form.watch('playerName');

  useEffect(() => {
    if (!playerNameValue) {
      setCardNames([]);
      return;
    }

    const existingPlayer = players.find(p => p.name.toLowerCase() === playerNameValue.toLowerCase());
    if (existingPlayer) {
        form.setValue('position', existingPlayer.position, { shouldValidate: true });
        form.setValue('style', existingPlayer.style, { shouldValidate: true });
        setCardNames(existingPlayer.cards.map(c => c.name));
    } else {
        setCardNames([]);
    }
  }, [playerNameValue, players, form]);

  function onSubmit(values: FormValues) {
    onAddRating(values);
    form.reset();
    setOpen(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Valoración
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Valoración</DialogTitle>
          <DialogDescription>
            Introduce los detalles del rendimiento de un jugador en el partido.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="playerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Jugador</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. L. Messi" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Carta</FormLabel>
                  <FormControl>
                    <>
                      <Input placeholder="e.g. POTW o nueva carta" {...field} list="card-names-list" autoComplete="off" />
                      <datalist id="card-names-list">
                        {cardNames.map(name => <option key={name} value={name} />)}
                      </datalist>
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posición</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una posición" />
                      </Trigger>
                    </FormControl>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estilo de Juego</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estilo" />
                      </Trigger>
                    </FormControl>
                    <SelectContent>
                      {playerStyles.map((style) => (
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
              name="rating"
              render={({ field }) => (
                <FormItem>
                   <FormLabel>Valoración: {field.value}</FormLabel>
                   <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Valoración</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
