
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDocs, arrayUnion } from 'firebase/firestore';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';
import type { FormationStats, MatchResult, AddFormationFormValues, AddMatchFormValues } from '@/lib/types';

export function useFormations() {
  const [formations, setFormations] = useState<FormationStats[]>([]);
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

    const unsub = onSnapshot(collection(db, "formations"), (snapshot) => {
      try {
        const formationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FormationStats));
        setFormations(formationsData);
        setError(null);
      } catch (err) {
        console.error("Error processing formations snapshot: ", err);
        setError("No se pudieron procesar los datos de las formaciones.");
        toast({
          variant: "destructive",
          title: "Error de Datos",
          description: "No se pudieron procesar los datos de las formaciones.",
        });
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Error fetching formations from Firestore: ", err);
      setError("No se pudo conectar a la base de datos para leer formaciones.");
      setFormations([]);
      setLoading(false);
      toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudo conectar a la base de datos para leer formaciones."
      });
    });

    return () => unsub();
  }, [toast]);

  const addFormation = async (values: AddFormationFormValues) => {
    try {
      const newFormation: Omit<FormationStats, 'id'> = {
        name: values.name,
        playStyle: values.playStyle,
        sourceUrl: values.sourceUrl || '',
        imageUrl: values.imageUrl || '',
        secondaryImageUrl: values.secondaryImageUrl || '',
        matches: [],
      };
      await addDoc(collection(db, 'formations'), newFormation);
      toast({ title: "Formación Añadida", description: `La formación "${values.name}" se ha guardado.` });
    } catch (error) {
      console.error("Error adding formation: ", error);
      toast({
        variant: "destructive",
        title: "Error al Guardar",
        description: `No se pudo guardar la formación.`,
      });
    }
  };

  const addMatchResult = async (values: AddMatchFormValues) => {
    try {
      const formationRef = doc(db, 'formations', values.formationId);
      const newResult: MatchResult = {
        id: uuidv4(),
        goalsFor: values.goalsFor,
        goalsAgainst: values.goalsAgainst,
        date: new Date().toISOString(),
      };
      await updateDoc(formationRef, {
        matches: arrayUnion(newResult)
      });
      toast({ title: "Resultado Añadido", description: `Marcador ${values.goalsFor} - ${values.goalsAgainst} guardado.` });
    } catch (error) {
      console.error("Error adding match result:", error);
      toast({
        variant: "destructive",
        title: "Error al Registrar",
        description: "No se pudo guardar el resultado del partido.",
      });
    }
  };

  const deleteFormation = async (formation: FormationStats) => {
    try {
      await deleteDoc(doc(db, 'formations', formation.id));
      toast({ title: "Formación Eliminada", description: "La formación y sus estadísticas han sido eliminadas." });
    } catch (error) {
      console.error("Error deleting formation:", error);
      toast({
        variant: "destructive",
        title: "Error al Eliminar",
        description: "No se pudo eliminar la formación.",
      });
    }
  };

  const downloadBackup = async () => {
    if (!db) return null;
    try {
      const formationsCollection = collection(db, 'formations');
      const formationSnapshot = await getDocs(formationsCollection);
      return formationSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching formations for backup: ", error);
      return null;
    }
  };

  return { formations, loading, error, addFormation, addMatchResult, deleteFormation, downloadBackup };
}
