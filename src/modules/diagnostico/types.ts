export type ModuleKey = 'motivos' | 'sintomas_fisicos' | 'sintomas_emocionales';

export type CatalogOption = {
  key: string;
  label: string;
  value?: any;
  order?: number;
};

export type CatalogItem = {
  id: number;
  key?: string;
  titulo: string;
  descripcion?: string | null;
  orden?: number;
  response_type?: string;
  options?: CatalogOption[];
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
