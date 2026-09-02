import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import App from './App';
import './index.css';

// Android hardware back: navigate back through the app's history instead of
// closing it; only exit when there is nowhere left to go back to.
if (Capacitor.isNativePlatform()) {
  void CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else void CapacitorApp.exitApp();
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
