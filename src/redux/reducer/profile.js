const initialState = {
  preferences: {
    notificaciones_correo: 1,
    notificaciones_push: 1,
    descarga_wifi: 1,
    accesibilidad_fuente: 'mediano',
    accesibilidad_contraste: 'estandar',
    idioma: 'es',
  },
  profileData: null,
};

export default function profile(state = initialState, action) {
  switch (action.type) {
    case 'SET_PROFILE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };
    case 'SET_PROFILE_DATA':
      return {
        ...state,
        profileData: action.payload,
      };
    default:
      return state;
  }
}
