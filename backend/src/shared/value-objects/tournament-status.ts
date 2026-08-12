export enum TournamentStatus {
    Draft = 'draft',
    Active = 'active',
    Finished = 'finished',
}

export function isTournamentStatus(value: string): value is TournamentStatus {
    return (Object.values(TournamentStatus) as string[]).includes(value);
}
