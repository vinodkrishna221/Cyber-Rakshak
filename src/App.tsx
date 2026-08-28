import { Link, Route, Routes } from 'react-router-dom';
import { Home, LogIn, MessageCircle, Search, ShieldCheck } from 'lucide-react';
import { PlaceholderPage } from './pages/PlaceholderPage';

const navigation = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/login', label: 'Login', icon: LogIn },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/track', label: 'Track', icon: Search },
];

export function App() {
  return (
    <div className="min-h-screen bg-paper-white text-navy">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link className="flex items-center gap-2 font-semibold text-navy" to="/">
            <ShieldCheck aria-hidden="true" className="text-chakra" />
            <span>Cyber Rakshak</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-1 text-sm">
            {navigation.map(({ to, label, icon: Icon }) => (
              <Link className="rounded-md px-3 py-2 hover:bg-blue-50" key={to} to={to}>
                <Icon aria-hidden="true" className="mr-1 inline size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Routes>
          <Route path="/" element={<PlaceholderPage title="A safer way to report cybercrime" route="/" />} />
          <Route path="/login" element={<PlaceholderPage title="Demo login" route="/login" />} />
          <Route path="/chat" element={<PlaceholderPage title="Complaint assistant" route="/chat" />} />
          <Route path="/preview" element={<PlaceholderPage title="Preview complaint" route="/preview" />} />
          <Route path="/success" element={<PlaceholderPage title="Demo acknowledgement" route="/success" />} />
          <Route path="/track" element={<PlaceholderPage title="Track a complaint" route="/track" />} />
          <Route path="*" element={<PlaceholderPage title="Page not found" route="unknown route" />} />
        </Routes>
      </main>
    </div>
  );
}
