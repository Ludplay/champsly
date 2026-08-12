export enum MatchStatus {
    Waiting = 'waiting',
    InProgress = 'in_progress',
    Finished = 'finished',
}

export function isMatchStatus(value: string): value is MatchStatus {
    return (Object.values(MatchStatus) as string[]).includes(value);
}
