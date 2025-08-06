import md5 from 'md5';

export const getGravatarURL = (email: string | undefined | null, size = 80) => {
  if (!email) {
    // Retourne une image par défaut si l'email n'est pas fourni
    return `https://www.gravatar.com/avatar/?d=mp&s=${size}`;
  }
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
};