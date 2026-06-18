export interface Pilier {
  id: number;
  emoji?: string;
  label: string;
  color: string;
}

export interface Statut {
  id: string;
  label: string;
  color: string;
}

export interface Promesse {
  id: number;
  titre: string;
  pilier_id: number;
  statut_id: string;
  page_programme?: number;
  detail?: string;
}

export interface Actu {
  id: string;
  date: string;
  titre: string;
  detail: string;
  type: string;
  promesses_liees: number[];
  dossier_lie: string | null;
  cm_lie: string | null;
  source_label?: string;
  source_url?: string;
}

export interface SourceSurvellee {
  id: string;
  label: string;
  url: string;
}
