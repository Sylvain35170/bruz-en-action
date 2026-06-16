export interface Pilier {
  id: number;
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
  id: number;
  date: string;
  titre: string;
  contenu: string;
  lien?: string;
  promesse_ids?: number[];
}

export interface SourceSurvellee {
  id: string;
  label: string;
  url: string;
}
