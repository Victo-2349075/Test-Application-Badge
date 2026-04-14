// api.js
import axios from "axios";
import { getUserFriendlyErrorMessage } from "./ErrorHandler";

/**
 * Détermine l'URL de base pour l'API Laravel.
 */
function getApiBaseUrl() {
  const configuredUrl = process.env.REACT_APP_LARAVEL_API_URL;
  if (typeof configuredUrl === "string" && configuredUrl.trim() !== "") {
    return configuredUrl;
  }
  return "/api";
}

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  responseType: "json",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Avant chaque requête
axiosInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    error.userFriendlyMessage = getUserFriendlyErrorMessage(error);
    return Promise.reject(error);
  }
);

// Après chaque réponse intercepte les erreurs
axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const statusCode = error?.response?.status;
    const message = error?.response?.data?.message;

    // Si token invalide/expiré
    if (statusCode === 401 && message === "Unauthenticated.") {
      sessionStorage.removeItem("token");
      delete axiosInstance.defaults.headers.common.Authorization;
    }

    error.userFriendlyMessage = getUserFriendlyErrorMessage(error);
    return Promise.reject(error);
  }
);

/**
 * Retourne le lien d'une image sur le serveur
 */
export function getResource(image) {
  if (typeof image !== "string" || image.trim() === "") {
    return undefined;
  }

  const resourceBaseUrl = process.env.REACT_APP_LARAVEL_RESOURCE_URL;
  if (!resourceBaseUrl || resourceBaseUrl.trim() === "") {
    return image;
  }

  return `${resourceBaseUrl}/${image}`;
}

export default axiosInstance;
