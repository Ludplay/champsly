export enum PhaseStatus {
    Waiting = 'waiting',
    InProgress = 'in_progress',
    Finished = 'finished',
}

export function isPhaseStatus(value: string): value is PhaseStatus {
    return (Object.values(PhaseStatus) as string[]).includes(value);
}
