import { useState } from 'react';

import PlayersPage from './features/players/pages/PlayersPage';
import TournamentsPage from './features/tournaments/pages/TournamentsPage';
import OngoingTournamentPage from './features/tournaments/pages/OngoingTournamentPage';
import GroupsPage from './features/groups/pages/GroupsPage';
import PhasesPage from './features/phases/pages/PhasesPage';
import TestsPage from './features/tests/pages/TestsPage';
import CodeTestsPage from './features/tests/pages/CodeTestsPage';

type Page = 'ongoing' | 'players' | 'tournaments' | 'groups' | 'phases' | 'tests' | 'codeTests';

function getNavButtonClass(page: Page, currentPage: Page) {
  const isActive = page === currentPage;
  return isActive ? 'px-4 py-2 rounded bg-blue-500 text-white' : 'px-4 py-2 rounded bg-white';
}

function renderPage(page: Page) {
  if (page === 'players') return <PlayersPage />;
  if (page === 'tournaments') return <TournamentsPage />;
  if (page === 'groups') return <GroupsPage />;
  if (page === 'phases') return <PhasesPage />;
  if (page === 'tests') return <TestsPage />;
  if (page === 'codeTests') return <CodeTestsPage />;
  return <OngoingTournamentPage />;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('ongoing');

  return (
    <div>
      <nav className="bg-slate-100 p-4">
        <div className="mx-auto max-w-6xl flex gap-4">
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
        </div>
      </nav>

      {renderPage(currentPage)}
    </div>
  );
}

export default App;
