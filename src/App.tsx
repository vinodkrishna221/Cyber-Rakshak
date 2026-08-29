import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { HomePage } from './pages/HomePage';
import { TrackPage } from './pages/TrackPage';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { PreviewPage } from './pages/PreviewPage';
import { SuccessPage } from './pages/SuccessPage';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/track" element={<TrackPage />} />
        <Route
          path="*"
          element={<PlaceholderPage titleKey="notFoundTitle" title="Page not found" route="unknown route" />}
        />
      </Routes>
    </AppShell>
  );
}

