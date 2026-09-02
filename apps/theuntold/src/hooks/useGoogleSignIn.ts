import { useCallback, useRef } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// Single source of truth for the Google Identity Services ambient type.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (listener?: (notification: {
            isNotDisplayed?: () => boolean;
            isSkippedMoment?: () => boolean;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

/** Waits for the async GIS script (index.html) to finish loading. */
function waitForGoogle(timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.google?.accounts) return resolve(true);
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      if (window.google?.accounts) {
        window.clearInterval(id);
        resolve(true);
      } else if (Date.now() - startedAt > timeoutMs) {
        window.clearInterval(id);
        resolve(false);
      }
    }, 150);
  });
}

/**
 * Google sign-in that copes with the real world: waits for the GIS script,
 * tries One Tap, and when the browser suppresses One Tap (cookie settings,
 * dismissal cooldowns) renders the official Google button into fallbackRef
 * — that button always works via popup.
 */
export function useGoogleSignIn() {
  const fallbackRef = useRef<HTMLDivElement>(null);

  /** Starts the flow. Resolves to an error message to display, or null when underway. */
  const signIn = useCallback(async (onCredential: (credential: string) => void): Promise<string | null> => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('your-')) {
      return 'Google sign-in is not configured yet — continue as guest for now.';
    }
    const loaded = await waitForGoogle();
    if (!loaded || !window.google) {
      return "Google didn't load — check your connection or ad blocker, then try again.";
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: ({ credential }) => onCredential(credential),
    });
    window.google.accounts.id.prompt((notification) => {
      const suppressed =
        notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.();
      if (suppressed && fallbackRef.current && window.google) {
        fallbackRef.current.hidden = false;
        fallbackRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(fallbackRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 280,
        });
      }
    });
    return null;
  }, []);

  return { signIn, fallbackRef };
}
