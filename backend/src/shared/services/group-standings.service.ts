import { InferAttributes } from 'sequelize';
import { Match } from '../../infra/db/models/match';
import type { GroupWithPlayers, GroupWithStats, PlayerStats, PlayerWithStats } from '../repositories/group.types';

export type StandingsMatch = Pick<
    InferAttributes<Match>,
    'group_id' | 'player1_id' | 'player2_id' | 'player1_score' | 'player2_score' | 'winner_player_id'
>;

/**
 * Computes wins/points per player, per group, from raw group + match data.
 * A pure function: no DB access, no side effects — in goes data, out comes standings.
 */
export function computeGroupStandings(groups: GroupWithPlayers[], matches: StandingsMatch[]): GroupWithStats[] {
    const statsByGroup = matches.reduce((acc: Record<number, Record<number, PlayerStats>>, match) => {
        const groupId = match.group_id as number;
        const groupStats = acc[groupId] || {};

        const ensurePlayer = (playerId: number) => {
            if (!groupStats[playerId]) {
                groupStats[playerId] = { wins: 0, points: 0 };
            }
            return groupStats[playerId];
        };

        const player1Stats = ensurePlayer(match.player1_id);
        const player2Stats = ensurePlayer(match.player2_id);

        player1Stats.points += Number(match.player1_score) || 0;
        player2Stats.points += Number(match.player2_score) || 0;

        if (match.winner_player_id) {
            ensurePlayer(match.winner_player_id).wins += 1;
        }

        acc[groupId] = groupStats;
        return acc;
    }, {});

    return groups.map((group): GroupWithStats => {
        const groupStats = statsByGroup[group.id] || {};
        const playersWithStats: PlayerWithStats[] = (group.Players || []).map((player) => ({
            ...player,
            wins: groupStats[player.id]?.wins || 0,
            points: groupStats[player.id]?.points || 0
        }));

        return {
            ...group,
            Players: playersWithStats
        };
    });
}
