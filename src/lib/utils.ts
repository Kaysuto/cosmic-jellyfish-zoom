import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// La liste des extensions de domaine (TLD) autorisées.
// Vous pouvez modifier cette liste pour ajouter ou supprimer des extensions.
const ALLOWED_TLDS = ['com', 'fr', 'net', 'org', 'dev', 'io', 'ai'];

// Création dynamique de la partie de l'expression régulière pour les TLDs
const tldPattern = ALLOWED_TLDS.join('|');

// Expression régulière stricte pour la validation des e-mails, limitée aux TLDs spécifiés.
// Le 'i' à la fin rend la validation insensible à la casse (ex: .COM est accepté).
export const strictEmailRegex = new RegExp(
  `^(([^<>()[\]\\\\.,;:\\s@"]+(\\.[^<>()[\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+(${tldPattern})))$`,
  'i'
);