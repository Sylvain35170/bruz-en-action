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
  date: string | null;
  titre: string;
  detail?: string;
  resume?: string;
  contenu?: string;
  type: string;
  dossier?: string;
  promesses_liees?: number[];
  cm_lie?: string | null;
  source_label?: string;
  source_url?: string;
  source_url_expiree?: boolean;
  lien_expire_risque?: boolean;
}

export interface SourceSurvellee {
  id: string;
  label: string;
  url: string;
}
