import { useEffect, useRef } from 'react';
import { authGuest } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export function useGuestAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const deviceToken = useAuthStore((s) => s.deviceToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const attempted = useRef(false);

  useEffect(() => {
    if (accessToken || attempted.current) return;
    attempted.current = true;
    authGuest(deviceToken)
      .then(setAuth)
      .catch(() => {
        attempted.current = false;
      });
  }, [accessToken, deviceToken, setAuth]);

  return { hasToken: !!accessToken };
}
