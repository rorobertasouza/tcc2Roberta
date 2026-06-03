import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../config.js";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export default function useGeolocation(userId?: string | number | null) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  const saveLocationToServer = useCallback(async (lat: number, lng: number) => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/geolocation.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_id: userId,
          latitude: lat,
          longitude: lng,
        }),
      });
    } catch (err) {
      console.error("Erro ao salvar localização:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: "Geolocalização não suportada pelo navegador",
        loading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setState({
          latitude,
          longitude,
          error: null,
          loading: false,
        });
        // Salvar no servidor
        saveLocationToServer(latitude, longitude);
      },
      (err) => {
        console.warn("Erro de geolocalização:", err.message);
        setState(prev => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache de 5 min
      }
    );
  }, [userId, saveLocationToServer]);

  return state;
}
