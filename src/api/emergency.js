import {API_BASE_URL} from './config';

export const getEmergencyContacts = async () => {
  try {
    const url = `${API_BASE_URL}/api/ws/emergency-contacts`;
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, options);
    
    // Si la respuesta no es OK, tratamos de devolver al menos el status
    if (!response.ok) {
      return { status: false, message: `Error ${response.status}` };
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return { status: false, message: 'Falla al conectar con el servidor', error };
  }
};
