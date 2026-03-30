/**
 * Outils de gestion d'erreurs pour harmoniser les messages
 * provenant d'Axios, de l'API Laravel et des erreurs JS locales.
 *
 * @author Philippe-Vu Beaulieu
 */

/**
 * Normalise certains messages de validation techniques en messages utilisateur.
 *
 * @author Philippe-Vu Beaulieu
 * @param {string} message Message brut reçu de l'API
 * @returns {string} Message utilisateur normalisé
 */
function normalizeValidationMessage(message) {
  if (typeof message !== "string") {
    return "";
  }

  const normalized = message.toLowerCase();

  if (
    normalized.includes("teacher code") &&
    (normalized.includes("sélectionné est invalide") || normalized.includes("selected is invalid"))
  ) {
    return "Le code enseignant est invalide, expiré ou déjà utilisé.";
  }

  if (normalized.includes("teacher_code") && normalized.includes("invalid")) {
    return "Le code enseignant est invalide, expiré ou déjà utilisé.";
  }

  return message;
}

/**
 * Détermine si une erreur provient d'une réponse HTTP Axios.
 *
 * @author Philippe-Vu Beaulieu
 * @param {any} error Objet erreur
 * @returns {boolean}
 */
export function isAxiosHttpError(error) {
  return Boolean(error && error.response && typeof error.response.status === "number");
}

/**
 * Construit un message utilisateur à partir d'une erreur technique.
 *
 * @author Philippe-Vu Beaulieu
 * @param {any} error Objet erreur
 * @returns {string} Message lisible par l'utilisateur
 */
export function getUserFriendlyErrorMessage(error) {
  if (isAxiosHttpError(error)) {
    const apiMessage = error?.response?.data?.message;

    if (typeof apiMessage === "string" && apiMessage.trim() !== "") {
      return normalizeValidationMessage(apiMessage);
    }

    if (error.response.status >= 500) {
      return "Une erreur serveur est survenue. Veuillez réessayer plus tard.";
    }

    return "La requête n'a pas pu être traitée.";
  }

  if (error?.request) {
    return "La connexion à échouer. Veuillez réessayer ultérieurement.";
  }

  if (typeof error?.message === "string" && error.message.trim() !== "") {
    return error.message;
  }
//switchcase

  return "Une erreur inattendue est survenue.";
}