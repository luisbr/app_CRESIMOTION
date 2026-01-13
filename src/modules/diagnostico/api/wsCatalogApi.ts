import {API_BASE_URL} from '../../../api/config';
import type {CatalogItem, ModuleKey} from '../types';
import {sortCatalogItems} from '../utils';

const fetchJson = async (path: string) => {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url);
  const contentType = res.headers?.get?.('content-type') || '';
  const rawBody = await res.text();
  let data: any = rawBody;
  if (rawBody && contentType.includes('application/json')) {
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      // keep raw body
    }
  }
  if (!res.ok) {
    const error: any = new Error(`Request failed with status ${res.status}`);
    error.status = res.status;
    error.body = data;
    throw error;
  }
  return data;
};

const normalizeItem = (item: any, moduleKey: ModuleKey): CatalogItem => {
  const rawOptions =
    (moduleKey === 'motivos' ? item?.intensidades : null) ??
    item?.options ??
    item?.opciones ??
    item?.evaluation_form?.options ??
    item?.evaluation_form?.opciones ??
    [];
  const optionList = Array.isArray(rawOptions)
    ? rawOptions
    : Array.isArray(rawOptions?.data)
    ? rawOptions.data
    : [];
  const options = optionList
    .map((opt: any, idx: number) => ({
      id: opt?.id != null ? Number(opt.id) : undefined,
      key: String(opt?.key ?? opt?.codigo ?? opt?.id ?? idx),
      label: String(opt?.label ?? opt?.nombre ?? opt?.titulo ?? opt?.texto ?? ''),
      value: opt?.value ?? opt?.valor,
      order: opt?.order ?? opt?.orden ?? idx,
    }))
    .sort((a: any, b: any) => Number(a.order ?? 0) - Number(b.order ?? 0));
  const behaviors = Array.isArray(item?.behaviors) ? item.behaviors : [];
  return {
    id: Number(item?.id),
    key: item?.key,
    titulo: item?.titulo || item?.nombre || item?.name || item?.motivo || 'Sin titulo',
    descripcion: item?.descripcion ?? item?.detalle ?? null,
    orden: item?.orden ?? item?.order,
    response_type: item?.response_type || item?.responseType || item?.tipo_respuesta,
    options,
    behaviors,
  };
};

const getCatalogByPath = async (path: string, moduleKey: ModuleKey) => {
  const data = await fetchJson(path);
  const list =
    data?.data || data?.items || data?.catalog || data?.catalogo || data || [];
  const rawItems = Array.isArray(list) ? list : [];
  const items = rawItems.map(item => normalizeItem(item, moduleKey)).map(item => {
    if (moduleKey === 'motivos') {
      return {...item, response_type: 'intensidad_estandar'};
    }
    if (!item.response_type && moduleKey === 'sintomas_fisicos') {
      return {...item, response_type: 'intensidad_estandar'};
    }
    return item;
  });
  return sortCatalogItems(items);
};

export const getMotivosCatalog = async () => {
  return getCatalogByPath('/api/ws/diagnostico/motivos', 'motivos');
};

export const getSintomasFisicosCatalog = async () => {
  return getCatalogByPath('/api/ws/diagnostico/sintomas-fisicos', 'sintomas_fisicos');
};

export const getSintomasEmocionalesCatalog = async () => {
  return getCatalogByPath('/api/ws/diagnostico/sintomas-emocionales', 'sintomas_emocionales');
};
