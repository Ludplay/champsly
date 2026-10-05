import type { GroupWithPlayers, GroupWithStats, PlayerWithStats } from '../repositories/group.types';
import type { GroupStandingRecord } from '../repositories/group-standings.types';
import type { PlayerStanding } from '../events';

export interface StandingsMatchResult {
    player1Id: number;
    player2Id: number;
    player1Score: number;
    player2Score: number;
    winnerPlayerId: number | null;
}

/**
 * Folds match results into per-player standings. Pure: the same results always give the
 * same standings, which is what lets them be rebuilt from the event log at any time.
 */
export function accumulateStandings(results: StandingsMatchResult[]): PlayerStanding[] {
    const standingsByPlayer = new Map<number, PlayerStanding>();

    const ensurePlayer = (playerId: number): PlayerStanding => {
        const existing = standingsByPlayer.get(playerId);

        if (existing) {
            return existing;
        }

        const created: PlayerStanding = { playerId, wins: 0, points: 0, matchesPlayed: 0 };
        standingsByPlayer.set(playerId, created);

        return created;
    };

    for (const result of results) {
        const player1Standing = ensurePlayer(result.player1Id);
        const player2Standing = ensurePlayer(result.player2Id);

        player1Standing.points += result.player1Score;
        player2Standing.points += result.player2Score;
        player1Standing.matchesPlayed += 1;
        player2Standing.matchesPlayed += 1;

        if (result.winnerPlayerId) {
            ensurePlayer(result.winnerPlayerId).wins += 1;
        }
    }

    return [...standingsByPlayer.values()].sort((a, b) => a.playerId - b.playerId);
}

// Players without a stored standing yet (no recorded result) are shown with zeros.
export function mergeGroupStandings(groups: GroupWithPlayers[], standings: GroupStandingRecord[]): GroupWithStats[] {
    const standingsByGroupAndPlayer = new Map<string, GroupStandingRecord>(
        standings.map((standing) => [`${standing.group_id}:${standing.player_id}`, standing])
    );

    return groups.map((group): GroupWithStats => {
        const playersWithStats: PlayerWithStats[] = (group.Players || []).map((player) => {
            const standing = standingsByGroupAndPlayer.get(`${group.id}:${player.id}`);

            return {
                ...player,
                wins: standing?.wins ?? 0,
                points: standing?.points ?? 0
            };
        });

        return {
            ...group,
            Players: playersWithStats
        };
    });
}
