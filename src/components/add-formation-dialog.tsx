
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

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const fileListSchema = typeof window !== 'undefined' ? z.instanceof(FileList) : z.any();


const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  playStyle: z.enum(formationPlayStyles),
  image: fileListSchema
    .refine(files => files && files.length === 1, "La imagen principal es obligatoria.")
    .refine(files => files?.[0]?.size <= MAX_FILE_SIZE, `El tamaño máximo es de 2MB.`)
    .refine(files => files?.[0]?.type && ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), "Solo se aceptan .jpg, .jpeg, .png y .webp."),
  secondaryImage: fileListSchema
    .refine(files => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `El tamaño máximo es de 2MB.`)
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), "Solo se aceptan .jpg, .jpeg, .png y .webp.")
    .optional(),
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
              name="image"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Imagen Principal</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => onChange(e.target.files)}
                      {...fieldProps}
                    />
                  </FormControl>
                   <FormDescription>Sube la táctica principal.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondaryImage"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                    <FormLabel>Imagen Secundaria (Opcional)</FormLabel>
                    <FormControl>
                        <Input 
                            type="file" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(e) => onChange(e.target.files)}
                            {...fieldProps}
                        />
                    </FormControl>
                    <FormDescription>Sube la táctica defensiva u ofensiva.</FormDescription>
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

