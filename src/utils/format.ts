export function greeting(h: number) {
  if (h < 6) return 'İyi Geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'Tünaydın';
  return 'İyi Akşamlar';
}

export function relativeTime(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Bugün ${time}`;
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return `Dün ${time}`;
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ` ${time}`;
}
