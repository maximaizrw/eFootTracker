
"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Player, PlayerStyle } from "@/lib/types";
import { playerStyles } from "@/lib/types";

const formSchema = z.object({
  playerId: z.string().optional(),
  playerName: z.string().min(2, "El nombre del jugador debe tener al menos 2 caracteres."),
  cardName: z.string().min(2, "El nombre de la carta debe tener al menos 2 caracteres."),
  style: z.enum(playerStyles),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

export type FormValues = z.infer<typeof formSchema>;

type AddPlayerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlayer: (values: FormValues) => void;
  players: Player[];
};

export function AddPlayerDialog({ open, onOpenChange, onAddPlayer, players }: AddPlayerDialogProps) {
  const [playerPopoverOpen, setPlayerPopoverOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: undefined,
      playerName: "",
      cardName: "Carta Base",
      style: "Ninguno",
      imageUrl: "",
    },
  });
  
  const playerIdValue = form.watch('playerId');

  useEffect(() => {
    if (open) {
      form.reset({
        playerId: undefined,
        playerName: "",
        cardName: "Carta Base",
        style: "Ninguno",
        imageUrl: "",
      });
    }
  }, [open, form]);

  useEffect(() => {
      const selectedPlayer = players.find(p => p.id === playerIdValue);
      if (selectedPlayer && form.getValues('playerName') !== selectedPlayer.name) {
          form.setValue('playerName', selectedPlayer.name);
      }
  }, [playerIdValue, players, form]);

  function onSubmit(values: FormValues) {
    onAddPlayer(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Jugador o Carta</DialogTitle>
          <DialogDescription>
            Registra un nuevo jugador en tu club o añade una nueva carta a un jugador existente. No se requiere valoración.
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
                          onValueChange={(search) => {
                            form.setValue('playerName', search, { shouldValidate: true });
                            form.setValue('playerId', undefined);
                          }}
                          value={field.value}
                          aria-label="Nombre del jugador"
                        />
                        <CommandEmpty>No se encontró el jugador. Puedes crearlo.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {players.map((player) => (
                              <CommandItem
                                key={player.id}
                                value={player.name}
                                onSelect={() => {
                                  form.setValue("playerId", player.id, { shouldValidate: true });
                                  form.setValue("playerName", player.name, { shouldValidate: true });
                                  setPlayerPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    playerIdValue === player.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {player.name}
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
                  <FormControl>
                    <Input placeholder="Ej: POTW, Highlight, Épico..." {...field} />
                  </FormControl>
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Jugador/Carta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    