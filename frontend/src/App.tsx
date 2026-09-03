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

function renderPage(page: Page, onLoginClick: () => void) {
  if (page === 'players') return <ProtectedRoute onLoginClick={onLoginClick}><PlayersPage /></ProtectedRoute>;
  if (page === 'tournaments') return <ProtectedRoute onLoginClick={onLoginClick}><TournamentsPage /></ProtectedRoute>;
  if (page === 'groups') return <ProtectedRoute onLoginClick={onLoginClick}><GroupsPage /></ProtectedRoute>;
  if (page === 'phases') return <ProtectedRoute onLoginClick={onLoginClick}><PhasesPage /></ProtectedRoute>;
  if (page === 'tests') return <TestsPage />;
  if (page === 'codeTests') return <CodeTestsPage />;
  if (page === 'login') return <LoginPage />;
  if (page === 'register') return <RegisterPage />;
  return <ProtectedRoute onLoginClick={onLoginClick}><OngoingTournamentPage /></ProtectedRoute>;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('ongoing');
  const { user, isAuthenticated, logout } = useAuth();

  // Adjusted during render, not in an effect, guarded to fire once per transition.
  const [wasAuthenticated, setWasAuthenticated] = useState(isAuthenticated);
  if (isAuthenticated !== wasAuthenticated) {
    setWasAuthenticated(isAuthenticated);
    if (isAuthenticated && currentPage === 'login') {
      setCurrentPage('ongoing');
    }
  }

  // The verification email links to this exact path — handled here, ahead of
  // the tab-based nav, since there's no router to match it against.
  if (window.location.pathname === '/verify-email') {
    return <VerifyEmailPage />;
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

      {renderPage(currentPage, () => setCurrentPage('login'))}
    </div>
  );
}

export default App;