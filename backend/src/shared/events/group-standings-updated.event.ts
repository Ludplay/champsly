import { DomainEvent, type DomainEventMetadata } from './domain-event';

export interface PlayerStanding {
    playerId: number;
    wins: number;
    points: number;
    matchesPlayed: number;
}

// A full snapshot, not a delta: the newest one per group is the group's complete standings.
export class GroupStandingsUpdated extends DomainEvent {
    readonly standings: PlayerStanding[];

    constructor(groupId: number, standings: PlayerStanding[], metadata?: DomainEventMetadata) {
        super(groupId, metadata);
        this.standings = standings;
    }
}
