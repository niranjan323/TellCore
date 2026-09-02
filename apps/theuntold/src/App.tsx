import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditStoryPage } from './pages/EditStoryPage';
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
import { UpgradePage } from './pages/UpgradePage';
import { UpgradeSuccessPage } from './pages/UpgradeSuccessPage';
import { PENDING_INVITE_KEY, VaultJoinPage } from './pages/VaultJoinPage';
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

/** A signed-out visitor opened a vault invite link: remember the token, send
 * them to Welcome, and PendingInviteRedirect picks it up after sign-in. */
function InviteGate() {
  const { token } = useParams<{ token: string }>();
  try {
    if (token) localStorage.setItem(PENDING_INVITE_KEY, token);
  } catch {
    // ignore
  }
  return <Navigate to="/welcome" replace />;
}

function PendingInviteRedirect() {
  const location = useLocation();
  let pending: string | null = null;
  try {
    pending = localStorage.getItem(PENDING_INVITE_KEY);
  } catch {
    // ignore
  }
  if (pending && !location.pathname.startsWith('/vault/join')) {
    return <Navigate to="/vault/join" replace />;
  }
  return null;
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
        <Route path="/vault/join/:token" element={<InviteGate />} />
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
    <>
    <PendingInviteRedirect />
    <Routes>
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/upgrade"
        element={
          <RequireAuth>
            <UpgradePage />
          </RequireAuth>
        }
      />
      <Route
        path="/upgrade/success"
        element={
          <RequireAuth>
            <UpgradeSuccessPage />
          </RequireAuth>
        }
      />
      <Route
        path="/vault/join/:token?"
        element={
          <RequireAuth>
            <VaultJoinPage />
          </RequireAuth>
        }
      />

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
        path="/story/:storyId/edit"
        element={
          <RequireAuth>
            <EditStoryPage />
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
    </>
  );
}
