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
import { WriteStoryPage } from './pages/WriteStoryPage';
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
  const onboardingDone = useAuthStore((s) => s.onboardingComplete);
  const theme = useTheme();
  const cfg = useAppConfig();

  if (!accessToken || theme.isLoading || cfg.isLoading) {
    return <SplashScreen />;
  }

  if (!onboardingDone) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/today" element={<TodayPromptPage />} />
      <Route path="/today/voice" element={<VoiceRecordingPage />} />
      <Route path="/today/write" element={<WriteStoryPage />} />

      <Route
        path="/"
        element={
          <Shell>
            <DashboardPage />
          </Shell>
        }
      />
      <Route
        path="/stories"
        element={
          <Shell>
            <MyStoriesPage />
          </Shell>
        }
      />
      <Route
        path="/story/:storyId"
        element={
          <Shell>
            <StoryDetailPage />
          </Shell>
        }
      />
      <Route
        path="/featured"
        element={
          <Shell>
            <FeaturedFeedPage />
          </Shell>
        }
      />
      <Route path="/featured/:storyId" element={<StoryOfTheDayPage />} />
      <Route
        path="/profile"
        element={
          <Shell>
            <ProfilePage />
          </Shell>
        }
      />
      <Route
        path="/vault"
        element={
          <Shell>
            <FamilyVaultPage />
          </Shell>
        }
      />
      <Route
        path="/notifications"
        element={
          <Shell>
            <NotificationsPage />
          </Shell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
