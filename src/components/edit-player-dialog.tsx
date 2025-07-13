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
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  playerId: z.string().min(1, "Se requiere el ID del jugador."),
  currentPlayerName: z.string().min(2, "El nombre del jugador debe tener al menos 2 caracteres."),
});

export type FormValues = z.infer<typeof formSchema>;

type EditPlayerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditPlayer: (values: FormValues) => void;
  initialData?: FormValues;
};

export function EditPlayerDialog({ open, onOpenChange, onEditPlayer, initialData }: EditPlayerDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        playerId: '',
        currentPlayerName: '',
    }
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    }
  }, [open, initialData, form]);

  function onSubmit(values: FormValues) {
    onEditPlayer(values);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Nombre del Jugador</DialogTitle>
          <DialogDescription>
            Modifica el nombre del jugador. Este nombre se aplicará a todas sus cartas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPlayerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Jugador</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: L. Messi" {...field} />
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
