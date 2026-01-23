export type ModuleKey = 'motivos' | 'sintomas_fisicos' | 'sintomas_emocionales';

export type CatalogOption = {
  id?: number;
  key: string;
  label: string;
  value?: any;
  order?: number;
};

export type CatalogBehavior = {
  option_id?: number;
  option_key?: string;
  text_below?: string;
  text_style?: string;
  icon_key?: string;
  active?: boolean;
  show_text_below?: boolean;
};

export type CatalogItem = {
  id: number;
  key?: string;
  titulo: string;
  descripcion?: string | null;
  orden?: number;
  response_type?: string;
  options?: CatalogOption[];
  behaviors?: CatalogBehavior[];
};

export type MotivoCategory = {
  id: number;
  key?: string;
  nombre: string;
  descripcion?: string | null;
  orden?: number;
  motivos: CatalogItem[];
};

export type SessionStartResponse = {
  session: { id: number; module_key: ModuleKey; status?: string };
  selection?: { selected_item_ids?: number[] };
  answers?: Array<{ item_id: number; response_type?: string; intensity_key?: string; intensity_value?: number; special_value?: any }>;
};

export type SessionResults = {
  session?: any;
  groups?: Array<{ title?: string; items?: Array<{ label?: string; value?: any }> } | any>;
  risk?: { is_triggered?: boolean; message?: string };
};

export type HistoryItem = {
  id: number;
  module_key: ModuleKey;
  completed_at?: string;
};
