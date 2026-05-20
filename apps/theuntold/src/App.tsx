import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FamilyVaultPage } from './pages/FamilyVaultPage';
import { FeaturedFeedPage } from './pages/FeaturedFeedPage';
import { MyStoriesPage } from './pages/MyStoriesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';
import { SplashScreen } from './pages/SplashScreen';
import { StoryDetailPage } from './pages/StoryDetailPage';
import { StoryOfTheDayPage } from './pages/StoryOfTheDayPage';
import { TodayPromptPage } from './pages/TodayPromptPage';
import { VoiceRecordingPage } from './pages/VoiceRecordingPage';
import { WelcomePage } from './pages/WelcomePage';
import { WriteStoryPage } from './pages/WriteStoryPage';
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
  const onboardingDone = useAuthStore((s) => s.onboardingComplete);
  const theme = useTheme();
  const cfg = useAppConfig();

  // No token yet: show welcome (or legacy auth) — no auto-guest creation.
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
    return <SplashScreen />;
  }

  // Logged-in but onboarding pending: only allow onboarding routes.
  if (!onboardingDone) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/today"
        element={
          <RequireAuth>
            <TodayPromptPage />
          </RequireAuth>
        }
      />
      <Route
        path="/today/voice"
        element={
          <RequireAuth>
            <VoiceRecordingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/today/write"
        element={
          <RequireAuth>
            <WriteStoryPage />
          </RequireAuth>
        }
      />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Shell>
              <DashboardPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/stories"
        element={
          <RequireAuth>
            <Shell>
              <MyStoriesPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/story/:storyId"
        element={
          <RequireAuth>
            <Shell>
              <StoryDetailPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/featured"
        element={
          <RequireAuth>
            <Shell>
              <FeaturedFeedPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/featured/:storyId"
        element={
          <RequireAuth>
            <StoryOfTheDayPage />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Shell>
              <ProfilePage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/vault"
        element={
          <RequireAuth>
            <Shell>
              <FamilyVaultPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <Shell>
              <NotificationsPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
