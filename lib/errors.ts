/**
 * Traduce los errores más comunes de Firebase a mensajes claros en español.
 */
export function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('configuration-not-found')) {
    return 'Falta activar el método "Correo electrónico/Contraseña" en la consola de Firebase (Authentication > Sign-in method).';
  }
  if (normalized.includes('email-already-in-use') || normalized.includes('user already registered')) {
    return 'Ese correo ya tiene una cuenta. Inicia sesión.';
  }
  if (normalized.includes('invalid-credential') || normalized.includes('user-not-found') || normalized.includes('wrong-password') || normalized.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (normalized.includes('weak-password') || normalized.includes('password should be at least')) {
    return 'La contraseña es demasiado corta (mínimo 6 caracteres).';
  }
  if (normalized.includes('invalid-email') || normalized.includes('unable to validate email')) {
    return 'El correo electrónico no es válido.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'No se pudo conectar. Revisa tu conexión a internet.';
  }

  return message;
}

export function translateDbError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('permission-denied') || normalized.includes('permission denied')) {
    return 'No tienes permiso para realizar esta acción. Revisa las reglas de Firestore.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'No se pudo conectar. Revisa tu conexión a internet.';
  }
  if (normalized.includes('código inválido') || normalized.includes('codigo invalido')) {
    return 'Ese código de invitación no existe.';
  }

  return message;
}

export function getErrorMessage(error: unknown, fallback = 'Algo salió mal.'): string {
  if (error instanceof Error && error.message) return translateDbError(error.message);
  if (typeof error === 'string' && error) return translateDbError(error);
  return fallback;
}
