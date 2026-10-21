import type { Category, CategoryId } from '@/types';

export const CATEGORIES: readonly Category[] = [
  {
    id: 'daily',
    title: 'Günün Sözü',
    subtitle: 'Her güne ilham dolu bir ışık',
    icon: 'sunny',
    // Amber şafak & altın ışıltı
    gradient: ['#F59E0B', '#F97316'],
  },
  {
    id: 'motivation',
    title: 'Motivasyon',
    subtitle: 'Harekete geçiren tutkulu güç',
    icon: 'flame',
    // Güneş alevi & nar kırmızısı
    gradient: ['#FF5E62', '#FF9966'],
  },
  {
    id: 'philosophy',
    title: 'Felsefe',
    subtitle: 'Derin düşünce ve varoluş',
    icon: 'infinite',
    // Kozmik ametist & derin indigo
    gradient: ['#8B5CF6', '#6366F1'],
  },
  {
    id: 'success',
    title: 'Başarı',
    subtitle: 'Disiplin ve hedef ustalığı',
    icon: 'trophy',
    // Zümrüt adaçayı & jade yeşili
    gradient: ['#10B981', '#059669'],
  },
  {
    id: 'peace',
    title: 'Huzur',
    subtitle: 'Dingin zihin, derin nefes',
    icon: 'leaf',
    // Kristal okyanus & göksel turkuaz
    gradient: ['#06B6D4', '#3B82F6'],
  },
  {
    id: 'love',
    title: 'Sevgi',
    subtitle: 'Kalbe dokunan saf şefkat',
    icon: 'heart',
    // Kadife gül & şakayık pembesi
    gradient: ['#EC4899', '#F43F5E'],
  },
  {
    id: 'heartbreak',
    title: 'Acılı Sözler',
    subtitle: '+18 Acı sözler',
    icon: 'heart-dislike',
    // Koyu yakut & keder kırmızısı
    gradient: ['#881337', '#E11D48'],
  },
  {
    id: 'ramiz',
    title: 'Ramiz Dayı',
    subtitle: 'Sadakat, intikam ve hayat raconu',
    icon: 'glasses',
    // Kehribar bronz & tütün tonları
    gradient: ['#78350F', '#B45309'],
  },
  {
    id: 'kurtlar-vadisi',
    title: 'Kurtlar Vadisi',
    subtitle: 'Derin devlet, racon ve unutulmaz replikler',
    icon: 'shield-half',
    // Derin gece siyahı & çelik grisi
    gradient: ['#18181B', '#3F3F46'],
  },
  {
    id: 'ataturk',
    title: 'Mustafa Kemal Atatürk',
    subtitle: 'Akıl, bilim, bağımsızlık ve cumhuriyet',
    icon: 'star',
    // Asil kırmızı & Türk bayrağı alı
    gradient: ['#B91C1C', '#EF4444'],
  },
  {
    id: 'revolutionary',
    title: 'Devrimci',
    subtitle: 'Özgürlük, direniş ve adalet kavgası',
    icon: 'flame',
    // Kor ateşi & başkaldırı turuncusu
    gradient: ['#EA580C', '#C2410C'],
  },
  {
    id: 'cult-movies',
    title: 'Kült Filmler',
    subtitle: 'Sinema tarihinin efsane replikleri',
    icon: 'film',
    // Sinematik mor & neon menekşe
    gradient: ['#7C3AED', '#A855F7'],
  },
  {
    id: 'courage',
    title: 'Cesaret',
    subtitle: 'Korkunun bittiği yerde başlayan irade',
    icon: 'flash',
    // Korkusuz altın & kehribar şimşek
    gradient: ['#D97706', '#F59E0B'],
  },
  {
    id: 'poverty',
    title: 'Fakirlik',
    subtitle: 'Sokakların hüznü, yokluk ve onurlu yaşam',
    icon: 'cloud',
    // Duman grisi & sis mavisi
    gradient: ['#475569', '#64748B'],
  },
  {
    id: 'poetry',
    title: 'Şiir & Şair',
    subtitle: 'Usta kalemlerden mısralar ve dizeler',
    icon: 'journal',
    // Edebi zümrüt & turkuaz esinti
    gradient: ['#0D9488', '#14B8A6'],
  },
  {
    id: 'turkish-cinema',
    title: 'Türk Dizi & Filmler',
    subtitle: 'Yeşilçam ve ekranların unutulmaz replikleri',
    icon: 'tv',
    // Nostaljik fuşya & sinema gülkurusu
    gradient: ['#BE185D', '#FB7185'],
  },
] as const;

const byId = new Map(CATEGORIES.map((c) => [c.id, c]));

export function getCategory(id: CategoryId): Category {
  const category = byId.get(id);
  if (!category) throw new Error(`Bilinmeyen kategori: ${id}`);
  return category;
}

export const DEFAULT_ENABLED_CATEGORIES: CategoryId[] = ['daily', 'motivation', 'peace'];
