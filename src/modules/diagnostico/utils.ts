import AsyncStorage from '@react-native-async-storage/async-storage';
import type {CatalogItem, CatalogOption, ModuleKey} from './types';

export const DIAGNOSTICO_LAST_ROUTE_KEY = 'diagnostico_last_route';
export const DIAGNOSTICO_CHART_VIEW_KEY = 'diagnostico_chart_view';

export const standardIntensityOptions: CatalogOption[] = [
  {key: 'bajo', label: 'Bajo', value: 1, order: 1},
  {key: 'moderado', label: 'Moderado', value: 2, order: 2},
  {key: 'alto', label: 'Alto', value: 3, order: 3},
  {key: 'grave', label: 'Grave', value: 4, order: 4},
];

export const getModuleLabel = (moduleKey: ModuleKey) => {
  if (moduleKey === 'motivos') return 'Motivos';
  if (moduleKey === 'sintomas_fisicos') return 'Fisica';
  return 'Emocional';
};

export const sortCatalogItems = (items: CatalogItem[]) => {
  return [...items].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
};

export const normalizeOptions = (item: CatalogItem): CatalogOption[] => {
  if (item.response_type && item.response_type.startsWith('pensamiento_extremo')) {
    return item.options || [];
  }
  if (Array.isArray(item.options) && item.options.length) {
    return item.options;
  }
  return standardIntensityOptions;
};

export const saveLastRoute = async (payload: {
  session_id: number;
  module_key: ModuleKey;
  screen: 'Selection' | 'Wizard' | 'Results';
}) => {
  await AsyncStorage.setItem(DIAGNOSTICO_LAST_ROUTE_KEY, JSON.stringify(payload));
};

export const getLastRoute = async () => {
  const raw = await AsyncStorage.getItem(DIAGNOSTICO_LAST_ROUTE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const clearLastRoute = async () => {
  await AsyncStorage.removeItem(DIAGNOSTICO_LAST_ROUTE_KEY);
};

export const saveChartView = async (view: 'bar' | 'pie' | 'radar') => {
  await AsyncStorage.setItem(DIAGNOSTICO_CHART_VIEW_KEY, view);
};

export const getChartView = async () => {
  const view = await AsyncStorage.getItem(DIAGNOSTICO_CHART_VIEW_KEY);
  if (view === 'bar' || view === 'pie' || view === 'radar') return view;
  return 'bar';
};
