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
import { WelcomePage } from './pages/WelcomePage';
import { ErrorMessage } from './components/ui/ErrorMessage';
import { useTheme } from './hooks/useTheme';
import { useAppConfig } from './hooks/useAppConfig';
import { useAuthStore } from './store/authStore';

function Shell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export default function App() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const theme = useTheme();
  const cfg = useAppConfig();

  // Welcome can render before there's any token — it's how the user picks.
  if (!accessToken) {
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
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
      <Route path="/welcome" element={<Navigate to="/start" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/voice"
        element={
          <RequireAuth>
            <VoiceNotePage />
          </RequireAuth>
        }
      />
      <Route
        path="/questions"
        element={
          <RequireAuth>
            <QuestionsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/start"
        element={
          <RequireAuth>
            <Shell>
              <IntroPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/summary/:sessionId"
        element={
          <RequireAuth>
            <Shell>
              <SummaryPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/history"
        element={
          <RequireAuth>
            <Shell>
              <HistoryPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/start" replace />} />
      <Route path="*" element={<Navigate to="/start" replace />} />
    </Routes>
  );
}
