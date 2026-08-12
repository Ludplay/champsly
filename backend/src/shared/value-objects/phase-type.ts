export enum PhaseType {
    Groups = 'groups',
    Knockout = 'knockout',
}

export function isPhaseType(value: string): value is PhaseType {
    return (Object.values(PhaseType) as string[]).includes(value);
}
