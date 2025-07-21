
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import type { AddFormationFormValues, Position, PlayerStyle } from "@/lib/types";
import { formationPlayStyles, positions, FormationSlotSchema } from "@/lib/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, getAvailableStylesForPosition } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  creator: z.string().optional(),
  playStyle: z.enum(formationPlayStyles),
  slots: z.array(FormationSlotSchema).length(11, "Debe definir exactamente 11 posiciones."),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  secondaryImageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  sourceUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});


type AddFormationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFormation: (values: AddFormationFormValues) => void;
};

const defaultSlots = Array(11).fill({ position: 'DC', styles: [] });

// Function to generate slots from a formation name like "4-3-3"
const generateSlotsFromName = (name: string): { position: Position, styles: PlayerStyle[] }[] | null => {
  const parts = name.match(/(\d)-(\d)-(\d)-?(\d)?/);
  if (!parts) return null;

  const numbers = parts.slice(1).filter(Boolean).map(Number);
  const totalPlayers = numbers.reduce((sum, num) => sum + num, 0);
  if (totalPlayers !== 10) return null; // Expects 10 field players + 1 GK

  let generatedSlots: { position: Position, styles: PlayerStyle[] }[] = [{ position: 'PT', styles: [] }];
  
  const [def, mid, fwd, fwd2] = numbers;
  
  // Defenders
  if (def === 4) generatedSlots.push({ position: 'LI', styles: [] }, { position: 'DFC', styles: [] }, { position: 'DFC', styles: [] }, { position: 'LD', styles: [] });
  else if (def === 3) generatedSlots.push({ position: 'DFC', styles: [] }, { position: 'DFC', styles: [] }, { position: 'DFC', styles: [] });
  else if (def === 5) generatedSlots.push({ position: 'LI', styles: [] }, { position: 'DFC', styles: [] }, { position: 'DFC', styles: [] }, { position: 'DFC', styles: [] }, { position: 'LD', styles: [] });

  // Midfielders
  if (fwd2) { // e.g. 4-2-3-1
      const holdingMid = mid;
      const attackingMid = fwd;
      if (holdingMid === 2) generatedSlots.push({ position: 'MCD', styles: [] }, { position: 'MCD', styles: [] });
      if (attackingMid === 3) generatedSlots.push({ position: 'EXI', styles: [] }, { position: 'MO', styles: [] }, { position: 'EXD', styles: [] });
  } else {
      if (mid === 3) generatedSlots.push({ position: 'MC', styles: [] }, { position: 'MCD', styles: [] }, { position: 'MC', styles: [] });
      else if (mid === 4) generatedSlots.push({ position: 'MDI', styles: [] }, { position: 'MC', styles: [] }, { position: 'MC', styles: [] }, { position: 'MDD', styles: [] });
      else if (mid === 5) generatedSlots.push({ position: 'MDI', styles: [] }, { position: 'MC', styles: [] }, { position: 'MCD', styles: [] }, { position: 'MC', styles: [] }, { position: 'MDD', styles: [] });
  }
  
  // Forwards
  const finalFwds = fwd2 || fwd;
  if (finalFwds === 1) generatedSlots.push({ position: 'DC', styles: [] });
  else if (finalFwds === 2) generatedSlots.push({ position: 'DC', styles: [] }, { position: 'DC', styles: [] });
  else if (finalFwds === 3) generatedSlots.push({ position: 'EXI', styles: [] }, { position: 'DC', styles: [] }, { position: 'EXD', styles: [] });
  
  if (generatedSlots.length !== 11) {
    const needed = 11 - generatedSlots.length;
    for(let i=0; i<needed; i++) generatedSlots.push({ position: 'MC', styles: [] });
  }

  return generatedSlots.slice(0, 11);
};


export function AddFormationDialog({ open, onOpenChange, onAddFormation }: AddFormationDialogProps) {
  const form = useForm<AddFormationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      creator: "",
      playStyle: "Contraataque rápido",
      slots: defaultSlots,
      imageUrl: "",
      secondaryImageUrl: "",
      sourceUrl: "",
    },
  });

  const { fields, update, replace } = useFieldArray({
    control: form.control,
    name: "slots",
  });
  
  const watchedSlots = form.watch('slots');
  const watchedName = form.watch('name');

  useEffect(() => {
    const generated = generateSlotsFromName(watchedName);
    if (generated) {
      replace(generated);
    }
  }, [watchedName, replace]);

  function onSubmit(values: AddFormationFormValues) {
    onAddFormation(values);
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Formación Táctica</DialogTitle>
          <DialogDescription>
            Define los 11 puestos, especificando posición y estilo de juego para cada uno. Prueba nombrar la formación como "4-3-3" o "4-2-3-1" para un auto-rellenado.
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
                name="creator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Creador (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Zeitzler" {...field} />
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
                {fields.map((field, index) => {
                  const currentPosition = watchedSlots[index]?.position as Position;
                  const availableStyles = getAvailableStylesForPosition(currentPosition, false);

                  return (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start p-2 border-b">
                      <p className="font-medium md:col-span-1 pt-8">Jugador {index + 1}</p>
                      <FormField
                        control={form.control}
                        name={`slots.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posición</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                update(index, { ...watchedSlots[index], position: value as Position, styles: [] });
                              }} 
                              value={field.value}
                            >
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
                          name={`slots.${index}.styles`}
                          render={({ field }) => (
                              <FormItem className="flex flex-col">
                                  <FormLabel>Estilos de Juego Permitidos</FormLabel>
                                  <Popover>
                                      <PopoverTrigger asChild>
                                          <FormControl>
                                              <Button
                                                  variant="outline"
                                                  role="combobox"
                                                  className={cn("justify-between h-auto", !field.value || field.value.length === 0 && "text-muted-foreground")}
                                              >
                                                  <div className="flex gap-1 flex-wrap">
                                                      {field.value && field.value.length > 0 ? (
                                                        field.value.map((style) => (
                                                            <Badge
                                                                variant="secondary"
                                                                key={style}
                                                                className="mr-1"
                                                            >
                                                                {style}
                                                            </Badge>
                                                        ))
                                                      ) : (
                                                          "Cualquiera"
                                                      )}
                                                  </div>
                                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                              </Button>
                                          </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="p-0">
                                          <Command>
                                              <CommandInput placeholder="Buscar estilo..." />
                                              <CommandList>
                                                  <CommandEmpty>No se encontró el estilo.</CommandEmpty>
                                                  {availableStyles.map((style) => {
                                                    const onSelect = () => {
                                                      const currentValues = field.value || [];
                                                      const isSelected = currentValues.includes(style);
                                                      const newValues = isSelected
                                                          ? currentValues.filter(s => s !== style)
                                                          : [...currentValues, style];
                                                      field.onChange(newValues);
                                                    };
                                                    return (
                                                      <CommandItem
                                                          key={style}
                                                          onSelect={onSelect}
                                                          onClick={onSelect}
                                                      >
                                                          <Check
                                                              className={cn(
                                                                  "mr-2 h-4 w-4",
                                                                  field.value?.includes(style)
                                                                      ? "opacity-100"
                                                                      : "opacity-0"
                                                              )}
                                                          />
                                                          {style}
                                                      </CommandItem>
                                                  );
                                                  })}
                                              </CommandList>
                                          </Command>
                                      </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                              </FormItem>
                          )}
                        />
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL Táctica Principal (Opcional)</FormLabel>
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
                        <FormLabel>URL Táctica Secundaria (Opcional)</FormLabel>
                        <FormControl>
                        <Input placeholder="https://ejemplo.com/tactica_sec.png" {...field} />
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
                        <FormLabel>URL Fuente (Opcional)</FormLabel>
                        <FormControl>
                        <Input placeholder="https://youtube.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <DialogFooter>
              <Button type="submit">Guardar Formación</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    