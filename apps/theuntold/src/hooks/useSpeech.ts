import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/** BCP-47 tags so the device picks the right voice for each language. */
const LANG_TAGS: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN',
  ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN',
  ur: 'ur-IN', es: 'es-ES', fr: 'fr-FR', de: 'de-DE', pt: 'pt-BR', ar: 'ar-SA',
};

const isNative = Capacitor.isNativePlatform();

/** Split into sentence-ish chunks — long single utterances stall some engines. */
function chunk(text: string, maxChars = 220): string[] {
  const sentences = text.replaceAll('\n', ' ').split(/(?<=[.!?।։۔])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= maxChars) current = candidate;
    else {
      if (current) chunks.push(current);
      current = sentence.length > maxChars ? sentence.slice(0, maxChars) : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Read a story aloud. In the Android/iOS apps this uses the device's native
 * TTS engine via a Capacitor plugin (Android WebViews have no window.speechSynthesis);
 * on the web it uses the browser's speech engine.
 */
export function useSpeech() {
  const webSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const supported = isNative || webSupported;
  const [speaking, setSpeaking] = useState(false);
  const cancelled = useRef(false);

  const stop = useCallback(() => {
    cancelled.current = true;
    if (isNative) void TextToSpeech.stop().catch(() => undefined);
    else if (webSupported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [webSupported]);

  const speak = useCallback(
    (text: string, languageCode?: string | null) => {
      if (!supported || !text.trim()) return;
      cancelled.current = false;
      const lang = LANG_TAGS[(languageCode ?? 'en').toLowerCase()] ?? languageCode ?? 'en-US';

      if (isNative) {
        setSpeaking(true);
        void (async () => {
          try {
            await TextToSpeech.stop().catch(() => undefined);
            await TextToSpeech.speak({ text, lang, rate: 0.95 });
          } catch {
            // missing voice for this language, or engine unavailable
          } finally {
            if (!cancelled.current) setSpeaking(false);
          }
        })();
        return;
      }

      window.speechSynthesis.cancel();
      setSpeaking(true);
      const parts = chunk(text);
      parts.forEach((part, index) => {
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.lang = lang;
        utterance.rate = 0.95;
        if (index === parts.length - 1) {
          utterance.onend = () => {
            if (!cancelled.current) setSpeaking(false);
          };
        }
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      });
    },
    [supported],
  );

  useEffect(
    () => () => {
      if (isNative) void TextToSpeech.stop().catch(() => undefined);
      else if (webSupported) window.speechSynthesis.cancel();
    },
    [webSupported],
  );

  return { supported, speaking, speak, stop };
}
