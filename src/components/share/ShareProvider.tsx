import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';

import type { Quote } from '@/types';
import { StoryStudioModal } from './StoryStudioModal';

type ShareFn = (quote: Quote) => void;
const ShareContext = createContext<ShareFn>(() => {});

/**
 * Paylaşım Sağlayıcısı:
 * Bir söz paylaşılmak istendiğinde doğrudan interaktif Hikaye Tasarım Stüdyosu'nu açar.
 * Kullanıcı dilediği arka planı (degradeler veya kendi galerisinden fotoğraf),
 * sözün konumunu ve yazı tipini seçip kusursuz bir Instagram/WhatsApp hikayesi üretebilir.
 */
export function ShareProvider({ children }: PropsWithChildren) {
  const [studioQuote, setStudioQuote] = useState<Quote | null>(null);

  const share = useCallback<ShareFn>((q) => {
    setStudioQuote(q);
  }, []);

  return (
    <ShareContext.Provider value={share}>
      {children}
      <StoryStudioModal
        visible={studioQuote !== null}
        quote={studioQuote}
        onClose={() => setStudioQuote(null)}
      />
    </ShareContext.Provider>
  );
}

export const useShareQuote = () => useContext(ShareContext);
