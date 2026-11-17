import axios from "axios";

// Ajuste l'IP si tu testes depuis un autre appareil que ce PC.
/// <reference types="vite/client" />

export const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({ baseURL: API_URL });

// Ajoute automatiquement le token JWT sur chaque requete, s'il existe.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
