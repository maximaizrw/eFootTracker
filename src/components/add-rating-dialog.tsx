"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, ChevronsUpDown } from 'lucide-react';

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
import type { Player, Position, PlayerStyle } from "@/lib/types";
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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRating: (values: FormValues) => void;
  players: Player[];
  initialData?: Partial<FormValues>;
};

export function AddRatingDialog({ open, onOpenChange, onAddRating, players, initialData }: AddRatingDialogProps) {
  const [playerPopoverOpen, setPlayerPopoverOpen] = useState(false);
  const [cardPopoverOpen, setCardPopoverOpen] = useState(false);
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
  const positionValue = form.watch('position');

  useEffect(() => {
    if (open) {
      const defaultValues = {
        playerName: '',
        cardName: 'Carta Base',
        position: 'DC' as Position,
        style: 'Ninguno' as PlayerStyle,
        rating: 5,
      };
      const resetValues = { ...defaultValues, ...initialData };
      form.reset(resetValues);

      if (resetValues.playerName) {
        const existingPlayer = players.find(p => p.name.toLowerCase() === resetValues.playerName!.toLowerCase());
        if (existingPlayer) {
            setCardNames(existingPlayer.cards.map(c => c.name));
        }
      } else {
        setCardNames([]);
      }
    }
  }, [open, initialData, form, players]);


  useEffect(() => {
    // Don't run this logic if we are pre-filling the form from initialData
    if (initialData?.playerName && form.getValues('playerName') === initialData.playerName) {
      return;
    }

    if (!playerNameValue) {
      setCardNames([]);
      form.setValue('style', 'Ninguno');
      form.setValue('cardName', 'Carta Base');
      return;
    }

    const existingPlayer = players.find(p => p.name.toLowerCase() === playerNameValue.toLowerCase());
    if (existingPlayer) {
        form.setValue('style', existingPlayer.style, { shouldValidate: true });
        setCardNames(existingPlayer.cards.map(c => c.name));
        form.setValue('cardName', '');
    } else {
        setCardNames([]);
        form.setValue('style', 'Ninguno');
        form.setValue('cardName', 'Carta Base');
    }
  }, [playerNameValue, players, form, initialData]);

  const availableStyles = useMemo(() => {
    const gkStyles: PlayerStyle[] = ['Ninguno', 'Portero defensivo', 'Portero ofensivo'];
    const fbStyles: PlayerStyle[] = ['Ninguno', 'Lateral defensivo', 'Lateral Ofensivo', 'Lateral finalizador'];
    const dfcStyles: PlayerStyle[] = ['Ninguno', 'El destructor', 'Creador de juego', 'Atacante extra'];
    const mcdStyles: PlayerStyle[] = ['Ninguno', 'Omnipresente', 'Medio escudo', 'Organizador', 'El destructor'];
    const mcStyles: PlayerStyle[] = ['Ninguno', 'Jugador de huecos', 'Omnipresente', 'Medio escudo', 'El destructor', 'Organizador'];
    const mdiMddStyles: PlayerStyle[] = ['Ninguno', 'Omnipresente', 'Jugador de huecos', 'Especialista en centros', 'Extremo móvil', 'Creador de jugadas'];

    if (positionValue === 'PT') return gkStyles;
    if (positionValue === 'LI' || positionValue === 'LD') return fbStyles;
    if (positionValue === 'DFC') return dfcStyles;
    if (positionValue === 'MCD') return mcdStyles;
    if (positionValue === 'MC') return mcStyles;
    if (positionValue === 'MDI' || positionValue === 'MDD') return mdiMddStyles;
    
    const exclusiveStyles: PlayerStyle[] = [
        'Portero defensivo', 
        'Portero ofensivo', 
        'Lateral defensivo', 
        'Lateral Ofensivo', 
        'Lateral finalizador',
        'Atacante extra',
        'Creador de juego',
        'Medio escudo',
        'Organizador',
        'El destructor',
        'Omnipresente',
        'Jugador de huecos',
        'Especialista en centros',
        'Extremo móvil',
        'Creador de jugadas',
    ];
    return playerStyles.filter(style => !exclusiveStyles.includes(style));
  }, [positionValue]);

  useEffect(() => {
    const currentStyle = form.getValues('style');
    if (!availableStyles.includes(currentStyle)) {
      form.setValue('style', 'Ninguno', { shouldValidate: true });
    }
  }, [positionValue, form, availableStyles]);


  function onSubmit(values: FormValues) {
    onAddRating(values);
    onOpenChange(false);
  }
  
  const playerNames = [...new Set(players.map(p => p.name))];
  const isQuickAdd = !!initialData?.playerName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Valoración</DialogTitle>
          <DialogDescription>
            {isQuickAdd 
              ? `Añadiendo nueva valoración para ${initialData.playerName} - ${initialData.cardName}`
              : "Introduce los detalles del rendimiento de un jugador en el partido."
            }
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
                          className={cn("w-full justify-between", isQuickAdd && "text-muted-foreground")}
                          disabled={isQuickAdd}
                          aria-label="Nombre del jugador"
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
                          aria-label="Nombre del jugador"
                        />
                        <CommandEmpty>No se encontró el jugador. Puedes crearlo.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {playerNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  form.setValue("playerName", currentValue === field.value ? "" : currentValue, { shouldValidate: true });
                                  setPlayerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.toLowerCase() === name.toLowerCase() ? "opacity-100" : "opacity-0"
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
                          className={cn("w-full justify-between", isQuickAdd && "text-muted-foreground")}
                          disabled={!playerNameValue || isQuickAdd}
                          aria-label="Nombre de la carta"
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
                          aria-label="Nombre de la carta"
                        />
                        <CommandEmpty>No se encontró la carta. Puedes crearla.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {cardNames.map((name) => (
                              <CommandItem
                                key={name}
                                value={name}
                                onSelect={(currentValue) => {
                                  form.setValue("cardName", currentValue === field.value ? "" : currentValue, { shouldValidate: true });
                                  setCardPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.toLowerCase() === name.toLowerCase() ? "opacity-100" : "opacity-0"
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isQuickAdd}>
                    <FormControl>
                    <SelectTrigger className={cn(isQuickAdd && "text-muted-foreground")}>
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isQuickAdd}>
                    <FormControl>
                    <SelectTrigger className={cn(isQuickAdd && "text-muted-foreground")}>
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
             <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                   <FormLabel>Valoración: {field.value.toFixed(1)}</FormLabel>
                   <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={0.5}
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
