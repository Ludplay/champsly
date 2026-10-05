import { useState } from 'react';

import { Button } from '@/components/ui/button';
import PlayersPage from './features/players/pages/PlayersPage';
import TournamentsPage from './features/tournaments/pages/TournamentsPage';
import OngoingTournamentPage from './features/tournaments/pages/OngoingTournamentPage';
import GroupsPage from './features/groups/pages/GroupsPage';
import PhasesPage from './features/phases/pages/PhasesPage';
import TestsPage from './features/tests/pages/TestsPage';
import CodeTestsPage from './features/tests/pages/CodeTestsPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { useAuth } from './features/auth/hooks/use-auth';

type Page = 'ongoing' | 'players' | 'tournaments' | 'groups' | 'phases' | 'tests' | 'codeTests' | 'login' | 'register';

function getNavButtonClass(page: Page, currentPage: Page) {
  const isActive = page === currentPage;
  return isActive ? 'px-4 py-2 rounded bg-blue-500 text-white' : 'px-4 py-2 rounded bg-white';
}

function renderPage(page: Page) {
  if (page === 'players') return <ProtectedRoute><PlayersPage /></ProtectedRoute>;
  if (page === 'tournaments') return <ProtectedRoute><TournamentsPage /></ProtectedRoute>;
  if (page === 'groups') return <ProtectedRoute><GroupsPage /></ProtectedRoute>;
  if (page === 'phases') return <ProtectedRoute><PhasesPage /></ProtectedRoute>;
  if (page === 'tests') return <TestsPage />;
  if (page === 'codeTests') return <CodeTestsPage />;
  if (page === 'login') return <LoginPage />;
  if (page === 'register') return <RegisterPage />;
  return <ProtectedRoute><OngoingTournamentPage /></ProtectedRoute>;
}

function App() {
  const { user, isAuthenticated, isRestoring, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(isAuthenticated ? 'ongoing' : 'login');

  // Adjusted during render, not in an effect, guarded to fire once per transition.
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);
  if (isAuthenticated !== wasAuthenticated) {
    setWasAuthenticated(isAuthenticated);
    if (isAuthenticated && currentPage === 'login') {
      setCurrentPage('ongoing');
    }
    if (!isAuthenticated) {
      setCurrentPage('login');
    }
  }

  // The verification email links to this exact path — handled here, ahead of
  // the tab-based nav, since there's no router to match it against.
  if (window.location.pathname === '/verify-email') {
    return <VerifyEmailPage />;
  }

  // Hold off until the startup restore settles, so a logged-in user doesn't see
  // a flash of the login page on reload.
  if (isRestoring) {
    return null;
  }

  return (
    <div>
      <nav className="bg-slate-100 p-4">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button onClick={() => setCurrentPage('ongoing')} className={getNavButtonClass('ongoing', currentPage)}>
                Ongoing
              </button>
              <button onClick={() => setCurrentPage('players')} className={getNavButtonClass('players', currentPage)}>
                Players
              </button>
              <button onClick={() => setCurrentPage('tournaments')} className={getNavButtonClass('tournaments', currentPage)}>
                Tournaments
              </button>
              <button onClick={() => setCurrentPage('groups')} className={getNavButtonClass('groups', currentPage)}>
                Groups
              </button>
              <button onClick={() => setCurrentPage('phases')} className={getNavButtonClass('phases', currentPage)}>
                Phases
              </button>
              <button onClick={() => setCurrentPage('tests')} className={getNavButtonClass('tests', currentPage)}>
                Tests
              </button>
              <button onClick={() => setCurrentPage('codeTests')} className={getNavButtonClass('codeTests', currentPage)}>
                Code Tests
              </button>
            </>
          ) : null}

          <div className="ml-auto flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">Logged in as {user?.name}</span>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <button onClick={() => setCurrentPage('login')} className={getNavButtonClass('login', currentPage)}>
                  Login
                </button>
                <button onClick={() => setCurrentPage('register')} className={getNavButtonClass('register', currentPage)}>
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {renderPage(currentPage)}
    </div>
  );
}

export default App;