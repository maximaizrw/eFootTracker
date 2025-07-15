
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useToast } from './use-toast';
import type { TrainingGuide, AddTrainingGuideFormValues } from '@/lib/types';

export function useTrainings() {
  const [trainingGuides, setTrainingGuides] = useState<TrainingGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      const errorMessage = "La configuración de Firebase no está completa.";
      setError(errorMessage);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "trainings"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      try {
        const guidesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TrainingGuide));
        setTrainingGuides(guidesData);
        setError(null);
      } catch (err) {
        console.error("Error processing training guides snapshot: ", err);
        setError("No se pudieron procesar los datos de las guías.");
        toast({
          variant: "destructive",
          title: "Error de Datos",
          description: "No se pudieron procesar los datos de las guías.",
        });
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching training guides from Firestore: ", err);
      setError("No se pudo conectar a la base de datos para leer las guías.");
      setTrainingGuides([]);
      setLoading(false);
      toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos para leer las guías."
      });
    });

    return () => unsub();
  }, [toast]);

  const addTrainingGuide = async (values: AddTrainingGuideFormValues) => {
    if (!db) return;
    try {
      const newGuide = {
        ...values,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'trainings'), newGuide);
      toast({ title: "Guía Añadida", description: `La guía "${values.title}" se ha guardado.` });
    } catch (error) {
      console.error("Error adding training guide: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: `No se pudo guardar la guía.`,
      });
    }
  };

  const deleteTrainingGuide = async (guideId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'trainings', guideId));
      toast({ title: "Guía Eliminada", description: "La guía de entrenamiento ha sido eliminada." });
    } catch (error) {
      console.error("Error deleting training guide:", error);
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar la guía.",
      });
    }
  };


  return { trainingGuides, loading, error, addTrainingGuide, deleteTrainingGuide };
}
