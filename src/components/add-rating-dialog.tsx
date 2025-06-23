"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Player, Position } from "@/lib/types";
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
  currentPosition: Position;
};

export function AddRatingDialog({ onAddRating, players, currentPosition }: AddRatingDialogProps) {
  const [open, setOpen] = useState(false);
  const [playerPopoverOpen, setPlayerPopoverOpen] = useState(false);
  const [cardPopoverOpen, setCardPopoverOpen] = useState(false);
  const [cardNames, setCardNames] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
      cardName: "Carta Base",
      position: currentPosition,
      style: "Ninguno",
      rating: 5,
    },
  });

  const playerNameValue = form.watch('playerName');

  useEffect(() => {
    if (open) {
      form.reset({
        playerName: "",
        cardName: "Carta Base",
        position: currentPosition,
        style: "Ninguno",
        rating: 5,
      });
      setCardNames([]);
    }
  }, [open, currentPosition, form]);

  useEffect(() => {
    if (!playerNameValue) {
      setCardNames([]);
      form.setValue('style', 'Ninguno');
      form.setValue('cardName', 'Carta Base');
      return;
    }

    const existingPlayer = players.find(p => p.name.toLowerCase() === playerNameValue.toLowerCase());
    if (existingPlayer) {
        form.setValue('position', existingPlayer.position, { shouldValidate: true });
        form.setValue('style', existingPlayer.style, { shouldValidate: true });
        setCardNames(existingPlayer.cards.map(c => c.name));
        form.setValue('cardName', '');
    } else {
        setCardNames([]);
        form.setValue('style', 'Ninguno');
        form.setValue('cardName', 'Carta Base');
    }
  }, [playerNameValue, players, form]);

  function onSubmit(values: FormValues) {
    onAddRating(values);
    form.reset();
    setOpen(false);
  }
  
  const playerNames = [...new Set(players.map(p => p.name))];

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
                   <Popover open={playerPopoverOpen} onOpenChange={setPlayerPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={playerPopoverOpen}
                          className="w-full justify-between"
                        >
                          {field.value || "Selecciona o crea un jugador..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Busca o crea un jugador..."
                          onValueChange={(search) => form.setValue('playerName', search)}
                          value={field.value}
                        />
                        <CommandEmpty>No se encontró el jugador. Puedes crearlo.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {playerNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  form.setValue("playerName", currentValue, { shouldValidate: true });
                                  setPlayerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                   <Popover open={cardPopoverOpen} onOpenChange={setCardPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cardPopoverOpen}
                          className="w-full justify-between"
                          disabled={!playerNameValue}
                        >
                          {field.value || "Selecciona o crea una carta..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Busca o crea una carta..."
                          onValueChange={(search) => form.setValue('cardName', search)}
                          value={field.value}
                        />
                        <CommandEmpty>No se encontró la carta. Puedes crearla.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {cardNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  form.setValue("cardName", currentValue, { shouldValidate: true });
                                  setCardPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                    </SelectTrigger>
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
                    </SelectTrigger>
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
