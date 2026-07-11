import { useEffect, useMemo, useState } from 'react';

import { useGroups } from '@/features/groups/hooks/use-groups';
import { useTournaments } from '../hooks/use-tournaments';
import { useMatches } from '@/features/phases/hooks/use-matches';
import { updateMatch } from '@/features/phases/services/matches-api';
import { generateGroupMatches } from '@/features/phases/services/phases-api';
import { Button } from '@/components/ui/button';
import type { Player } from '@/features/players/types/players';
import type { Group } from '@/features/groups/types/groups';

function sortPlayers(players: Player[]) {
  return [...players].sort((a, b) => {
    const aWins = (a as { wins?: number }).wins ?? 0;
    const bWins = (b as { wins?: number }).wins ?? 0;
    const aPoints = (a as { points?: number }).points ?? 0;
    const bPoints = (b as { points?: number }).points ?? 0;

    if (aWins !== bWins) {
      return bWins - aWins;
    }

    if (aPoints !== bPoints) {
      return bPoints - aPoints;
    }

    if (a.name && b.name) {
      return a.name.localeCompare(b.name);
    }

    return a.id - b.id;
  });
}

// Returns a numeric key used to order groups — uses group.number when available, falls back to group.id.
// Groups with no match get pushed to the end via POSITIVE_INFINITY.
function getGroupSortKey(group: Group | undefined): number {
  if (!group) return Number.POSITIVE_INFINITY;
  if (typeof group.number === 'number') return group.number;
  return group.id ?? 0;
}

export default function OngoingTournamentPage() {
  const { tournaments, loading: tournamentsLoading, error: tournamentsError } = useTournaments();
  const activeTournament = useMemo(
    () => tournaments.find((tournament) => tournament.status === 'active'),
    [tournaments],
  );
  const { groups, loading: groupsLoading, error: groupsError } = useGroups(activeTournament?.id, { skipIfNoTournamentId: true });

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);

  const { phases, loading: matchesLoading, error: matchesError, fetchMatches } = useMatches(activeTournament?.id);

  const tournamentGroups = useMemo(() => groups, [groups]);

  const loading = tournamentsLoading || groupsLoading;
  const error = tournamentsError ?? groupsError;

  const phasesErrorAny = matchesError;
  const phasesLoadingAny = matchesLoading;

  const tournamentPhases = phases;
  const currentPhaseIndex = Math.max(0, Math.min(activePhaseIndex, tournamentPhases.length - 1));
  const currentPhase = tournamentPhases[currentPhaseIndex];

  const roundNumbers = useMemo(() => {
    if (!currentPhase) {
      return [] as string[];
    }

    return Object.keys(currentPhase.round_numbers).sort((a, b) => Number(a) - Number(b));
  }, [currentPhase]);

  useEffect(() => {
    setActiveRoundIndex(0);
  }, [currentPhaseIndex]);

  const safeRoundIndex = Math.max(0, Math.min(activeRoundIndex, roundNumbers.length - 1));
  const currentRoundNumber = roundNumbers[safeRoundIndex];

  const hasPhaseAndRound = currentPhase && currentRoundNumber;
  const roundMatches = hasPhaseAndRound ? currentPhase.round_numbers[currentRoundNumber] ?? [] : [];

  // Prefer the group that contains both players; fall back to the group with either one.
  const getMatchedGroupForMatch = (match: any) => {
    const bothPlayersInSameGroup = (group: any) => {
      const hasPlayers = !!group.Players;
      const hasPlayer1 = group.Players?.some((p: any) => p.id === match.player1_id);
      const hasPlayer2 = group.Players?.some((p: any) => p.id === match.player2_id);
      return hasPlayers && hasPlayer1 && hasPlayer2;
    };

    const onePlayerInGroup = (group: any) => {
      const hasPlayers = !!group.Players;
      const hasPlayer1 = group.Players?.some((p: any) => p.id === match.player1_id);
      const hasPlayer2 = group.Players?.some((p: any) => p.id === match.player2_id);
      return hasPlayers && (hasPlayer1 || hasPlayer2);
    };

    const groupWithBothPlayers = tournamentGroups.find((g) => bothPlayersInSameGroup(g));
    const groupWithOnePlayer = tournamentGroups.find((g) => onePlayerInGroup(g));

    return groupWithBothPlayers ?? groupWithOnePlayer;
  };

  const sortedMatches = [...roundMatches].sort((a, b) => {
    const ga = getMatchedGroupForMatch(a);
    const gb = getMatchedGroupForMatch(b);

    const oa = getGroupSortKey(ga);
    const ob = getGroupSortKey(gb);

    if (oa !== ob) return oa - ob;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleGenerateGroupMatches = async () => {
    if (!activeTournament) return;
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      await generateGroupMatches(activeTournament.id);
      await fetchMatches();
    } catch (error) {
      setGenerateError(`Unable to generate matches. Please try again. Error: ${error}`);
    } finally {
      setGenerateLoading(false);
    }
  };

  const [scores, setScores] = useState<Record<number, { p1: number | null; p2: number | null; loading?: boolean; error?: string }>>({});

  useEffect(() => {
    const map: Record<number, { p1: number | null; p2: number | null }> = {};
    roundMatches.forEach((m: any) => {
      map[m.id] = {
        p1: typeof m.player1_score === 'number' ? m.player1_score : null,
        p2: typeof m.player2_score === 'number' ? m.player2_score : null,
      };
    });
    setScores(map);
  }, [currentPhase?.id, currentRoundNumber, roundMatches]);

  const setScoreValue = (matchId: number, side: 'p1' | 'p2', value: string) => {
    const isEmpty = value === '';
    const parsed = isEmpty ? null : Number(value.replace(/[^0-9]/g, ''));
    const existing = scores[matchId] ?? { p1: null, p2: null };
    setScores((prev) => ({ ...prev, [matchId]: { ...existing, [side]: parsed } }));
  };

  const handleSave = async (match: any) => {
    const s = scores[match.id];
    if (!s || s.p1 === null || s.p2 === null) return;
    if (s.p1 === s.p2) {
      setScores((prev) => ({ ...(prev), [match.id]: { ...(prev[match.id] ?? {}), error: 'Scores must not be equal' } }));
      return;
    }

    setScores((prev) => ({ ...(prev), [match.id]: { ...(prev[match.id] ?? {}), loading: true, error: undefined } }));

    const winnerId = s.p1 > s.p2 ? match.player1_id : match.player2_id;

    try {
      await updateMatch(match.id, { player1_score: s.p1 ?? undefined, player2_score: s.p2 ?? undefined, winner_player_id: winnerId });
      await fetchMatches();
      setScores((prev) => ({ ...(prev), [match.id]: { ...(prev[match.id] ?? {}), loading: false, error: undefined } }));
    } catch (err) {
      setScores((prev) => ({ ...(prev), [match.id]: { ...(prev[match.id] ?? {}), loading: false, error: 'Unable to save' } }));
    }
  };

  let phasesContent: React.ReactNode;
  if (phasesLoadingAny) {
    phasesContent = (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 mt-4">
        Loading phases and matches…
      </div>
    );
  } else if (phasesErrorAny) {
    phasesContent = (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 mt-4">
        Unable to load phases or matches.
      </div>
    );
  } else if (tournamentPhases.length === 0) {
    phasesContent = (
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 mt-4">
        <p className="text-base font-medium">No phases created for this tournament.</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Create phases to organize matches.</p>
          <Button className="rounded p-6 bg-lime-400" onClick={handleGenerateGroupMatches} disabled={generateLoading}>
            {generateLoading ? 'Generating…' : 'Generate group phase matches'}
          </Button>
        </div>
        {generateError ? <p className="mt-3 text-sm text-destructive">{generateError}</p> : null}
      </div>
    );
  } else {
    phasesContent = (
      <article className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Phase</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{currentPhase?.name ?? `Phase ${currentPhase?.id ?? ''}`}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              {roundMatches.length} matches
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              Round {currentRoundNumber || 'N/A'}
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveRoundIndex((i) => Math.max(0, i - 1))}
            className="rounded px-3 py-1 text-sm bg-slate-100"
            aria-label="Previous round"
          >
            ← Round
          </button>
          <button
            onClick={() => setActiveRoundIndex((i) => Math.min(roundNumbers.length - 1, i + 1))}
            className="rounded px-3 py-1 text-sm bg-slate-100"
            aria-label="Next round"
          >
            Round →
          </button>
        </div>

        <div className="space-y-3">
          {roundMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              No matches for this round yet.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedMatches.map((match) => {
                const matchedGroup = getMatchedGroupForMatch(match);
                const groupLabel = matchedGroup ? `${matchedGroup.name ?? `Group ${matchedGroup.number}`} - ` : '';

                const scoreEntry = scores[match.id];
                const hasBothScores = scoreEntry?.p1 !== null && scoreEntry?.p1 !== undefined
                  && scoreEntry?.p2 !== null && scoreEntry?.p2 !== undefined;
                const scoresAreTied = scoreEntry?.p1 === scoreEntry?.p2;
                const isSaveDisabled = !hasBothScores || scoresAreTied || !!scoreEntry?.loading;

                return (
                  <div key={match.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <span className="whitespace-nowrap">{match.player1_name ?? `#${match.player1_id ?? '?'}`}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-12 rounded border px-1 text-sm text-center"
                          value={scores[match.id]?.p1 ?? ''}
                          onChange={(e) => setScoreValue(match.id, 'p1', e.target.value)}
                        />
                        <span className="px-1">x</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-12 rounded border px-1 text-sm text-center"
                          value={scores[match.id]?.p2 ?? ''}
                          onChange={(e) => setScoreValue(match.id, 'p2', e.target.value)}
                        />
                        <span className="whitespace-nowrap">{match.player2_name ?? `#${match.player2_id ?? '?'}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-500">{groupLabel}Match #{match.id}</div>
                        <button
                          onClick={() => handleSave(match)}
                          disabled={isSaveDisabled}
                          className="rounded px-2 py-1 text-sm bg-blue-500 text-white disabled:opacity-50"
                        >
                          {scores[match.id]?.loading ? 'Saving…' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ongoing tournament</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Current active tournament</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            This dashboard shows the active tournament and its groups. Each group card includes assigned players and their score fields.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-6">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
            Loading tournament data…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            There was an error loading the ongoing tournament. Please refresh the page.
          </div>
        ) : !activeTournament ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            <p className="text-base font-medium">No active tournament found.</p>
            <p className="mt-2 text-sm text-slate-500">Create a tournament and set its status to &quot;active&quot; to see the dashboard here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Tournament</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeTournament.name}</h2>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  Status: <span className="font-semibold text-slate-900">{activeTournament.status}</span>
                </div>
              </div>
            </div>

            {tournamentGroups.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
                <p className="text-base font-medium">No groups have been created for this tournament yet.</p>
                <p className="mt-2 text-sm text-slate-500">Add groups and assign players to start tracking tournament progress.</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {tournamentGroups.map((group) => (
                  <article key={group.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Group</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-900">
                          {group.name ?? `Group ${group.number}`}
                        </h3>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                        {group.Players?.length ?? 0} players
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(group.Players && group.Players.length > 0) ? (
                        <div className="space-y-3">
                          {sortPlayers(group.Players).map((player) => {
                            const wins = (player as { wins?: number }).wins ?? 0;
                            const points = (player as { points?: number }).points ?? 0;

                            return (
                              <div key={player.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div>
                                  <p className="font-medium text-slate-900">{player.name}</p>
                                  <p className="text-sm text-slate-500">ID: {player.id}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                  <span className="rounded-full bg-slate-900 px-3 py-1 text-white">Wins: {wins}</span>
                                  <span className="rounded-full bg-slate-900 px-3 py-1 text-white">Score: {points}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                          No players are assigned to this group yet.
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Phases & Matches</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePhaseIndex((i) => Math.max(0, i - 1))}
                    className="rounded px-3 py-1 text-sm bg-slate-100"
                    aria-label="Previous phase"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setActivePhaseIndex((i) => Math.min(tournamentPhases.length - 1, i + 1))}
                    className="rounded px-3 py-1 text-sm bg-slate-100"
                    aria-label="Next phase"
                  >
                    →
                  </button>
                </div>
              </div>

              {phasesContent}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
