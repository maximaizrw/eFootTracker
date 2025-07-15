
"use client";

import { useEffect, useMemo } from "react";
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
import type { EditFormationFormValues, FormationStats, Position } from "@/lib/types";
import { formationPlayStyles, positions, FormationSlotSchema } from "@/lib/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, getAvailableStylesForPosition } from "@/lib/utils";


const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  playStyle: z.enum(formationPlayStyles),
  slots: z.array(FormationSlotSchema).length(11, "Debe definir exactamente 11 posiciones."),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  secondaryImageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
  sourceUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

const defaultSlots = Array(11).fill({ position: 'DC', styles: [] });

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

  const { fields, update } = useFieldArray({
    control: form.control,
    name: "slots",
  });
  
  const watchedSlots = form.watch('slots');

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        playStyle: initialData.playStyle,
        slots: initialData.slots && initialData.slots.length === 11 ? initialData.slots.map(s => ({...s, styles: s.styles || []})) : defaultSlots,
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
                {fields.map((field, index) => {
                  const currentPosition = watchedSlots[index]?.position as Position;
                  const availableStyles = getAvailableStylesForPosition(currentPosition, true);

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
                                // Reset styles when position changes
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
                                                  {availableStyles.map((style) => (
                                                      <CommandItem
                                                          key={style}
                                                          onSelect={() => {
                                                              const currentValues = field.value || [];
                                                              const isSelected = currentValues.includes(style);
                                                              const newValues = isSelected
                                                                  ? currentValues.filter(s => s !== style)
                                                                  : [...currentValues, style];
                                                              field.onChange(newValues);
                                                          }}
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
                                                  ))}
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
            
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
