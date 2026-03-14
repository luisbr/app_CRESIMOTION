import {API_BASE_URL} from './config';
import {getSession} from './auth';

const BASE = `${API_BASE_URL}/api/apoyo-financiero`;

/**
 * GET /api/apoyo-financiero/formulario
 * Retorna preguntas, opciones y configuración de texto para renderizar el formulario.
 */
export const obtenerFormularioApoyo = async () => {
  const res = await fetch(`${BASE}/formulario`);
  if (!res.ok) throw new Error('Error al cargar el formulario de apoyo financiero.');
  return res.json();
};

/**
 * POST /api/apoyo-financiero/solicitar
 * Envía las respuestas del formulario.
 * @param {Array} respuestas — [{pregunta_id, opcion_id}, ...]
 */
export const solicitarApoyoFinanciero = async (respuestas) => {
  const session = await getSession();
  
  const res = await fetch(`${BASE}/solicitar`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      usuario_id: session.id,
      respuestas,
    }),
  });

  if (!res.ok) {
    throw new Error(`Error del servidor (HTTP ${res.status})`);
  }

  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Error al enviar la solicitud.');
  }
  
  return data;
};

/**
 * GET /api/apoyo-financiero/estado?usuario_id=X
 * Retorna el estado de la solicitud y el código si fue aprobada.
 */
export const obtenerEstadoApoyo = async () => {
  const session = await getSession();
  const res = await fetch(`${BASE}/estado?usuario_id=${session.id}`);
  if (!res.ok) throw new Error('Error al obtener el estado del apoyo financiero.');
  return res.json();
};

/**
 * POST /api/apoyo-financiero/validar-codigo
 * Valida un código de descuento.
 * @param {string} codigo
 */
export const validarCodigoApoyo = async (codigo) => {
  const session = await getSession();
  const res = await fetch(`${BASE}/validar-codigo`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({codigo, usuario_id: session.id}),
  });
  if (!res.ok) throw new Error('Error al validar el código.');
  return res.json();
};
