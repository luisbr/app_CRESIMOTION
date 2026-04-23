import { useEffect } from 'react';
import { useSelector } from 'react-redux';

declare global {
  interface Window {
    __PROFILE_PREFERENCES__: {
      notificaciones_correo: number;
      notificaciones_push: number;
      descarga_wifi: number;
      accesibilidad_fuente: string;
      accesibilidad_contraste: string;
      idioma: string;
    };
  }
}

export const useProfilePreferencesSync = () => {
  const preferences = useSelector((state: any) => state.profile?.preferences);

  useEffect(() => {
    if (preferences) {
      (global as any).__PROFILE_PREFERENCES__ = preferences;
    }
  }, [preferences]);

  return preferences;
};

export const getProfilePreferences = () => {
  return (global as any).__PROFILE_PREFERENCES__ || {
    notificaciones_correo: 1,
    notificaciones_push: 1,
    descarga_wifi: 1,
    accesibilidad_fuente: 'mediano',
    accesibilidad_contraste: 'estandar',
    idioma: 'es',
  };
};
