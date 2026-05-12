import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { HistoryPage } from './pages/HistoryPage';
import { IntroPage } from './pages/IntroPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { SplashPage } from './pages/SplashPage';
import { SummaryPage } from './pages/SummaryPage';
import { VoiceNotePage } from './pages/VoiceNotePage';
import { ErrorMessage } from './components/ui/ErrorMessage';
import { useTheme } from './hooks/useTheme';
import { useAppConfig } from './hooks/useAppConfig';
import { useGuestAuth } from './hooks/useGuestAuth';
import { useAuthStore } from './store/authStore';

function Shell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  useGuestAuth();
  const accessToken = useAuthStore((s) => s.accessToken);
  const theme = useTheme();
  const cfg = useAppConfig();

  if (!accessToken) {
    return <SplashPage message="Starting your session…" />;
  }

  if (theme.isLoading || cfg.isLoading) {
    return <SplashPage />;
  }

  if (theme.isError && cfg.isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-secondary px-4">
        <div className="w-full max-w-form">
          <ErrorMessage
            message="We couldn't reach PreDoc. Please check your connection."
            retry={() => {
              theme.refetch();
              cfg.refetch();
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/voice" element={<VoiceNotePage />} />
      <Route path="/questions" element={<QuestionsPage />} />
      <Route
        path="/"
        element={
          <Shell>
            <IntroPage />
          </Shell>
        }
      />
      <Route
        path="/summary/:sessionId"
        element={
          <Shell>
            <SummaryPage />
          </Shell>
        }
      />
      <Route
        path="/history"
        element={
          <Shell>
            <HistoryPage />
          </Shell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
