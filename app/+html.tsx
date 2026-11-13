import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Web platformu için SEO ve meta etiketleri yapılandırması.
 * Sadece statik web render sırasında çalışır.
 */
export default function Root({ children }: PropsWithChildren) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'Kanki',
    alternateName: 'Kanki - Günün Sözü & Motivasyon',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Android, iOS',
    description:
      'Her gün ilham veren sözler, motivasyon bildirimleri ve estetik kilit ekranı widget’ı. Hayatına bilgelik ve huzur katan alıntılar.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '150',
    },
  };

  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* ── Standart SEO Meta ── */}
        <title>Kanki - Günün İlham Veren Sözleri & Kilit Ekranı Widget’ı</title>
        <meta
          name="description"
          content="Her gün ilham veren sözler, motivasyon bildirimleri ve estetik kilit ekranı widget’ı. Hayatına bilgelik, motivasyon ve huzur katan günlük alıntılar."
        />
        <meta
          name="keywords"
          content="kanki, günün sözü, motivasyon sözleri, ilham verici sözler, kilit ekranı widget, alıntılar, felsefe sözleri, kişisel gelişim, özlü sözler"
        />
        <meta name="author" content="Kanki" />
        <meta name="robots" content="index, follow" />

        {/* ── Open Graph / Facebook / WhatsApp ── */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:site_name" content="Kanki" />
        <meta
          property="og:title"
          content="Kanki - Günün İlham Veren Sözleri & Kilit Ekranı Widget’ı"
        />
        <meta
          property="og:description"
          content="Her gün ilham veren sözler, motivasyon bildirimleri ve estetik kilit ekranı widget’ı."
        />
        <meta property="og:image" content="/icon.png" />

        {/* ── Twitter Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Kanki - Günün İlham Veren Sözleri & Kilit Ekranı Widget’ı"
        />
        <meta
          name="twitter:description"
          content="Her gün ilham veren sözler, motivasyon bildirimleri ve estetik kilit ekranı widget’ı."
        />
        <meta name="twitter:image" content="/icon.png" />

        {/* ── Mobil & PWA Ayarları ── */}
        <meta name="theme-color" content="#07070F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kanki" />

        {/* ── Schema.org JSON-LD Yapısal Verisi ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

