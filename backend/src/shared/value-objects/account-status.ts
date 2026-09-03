export enum AccountStatus {
    PendingVerification = 'pending_verification',
    Verified = 'verified',
}

export function isAccountStatus(value: string): value is AccountStatus {
    return (Object.values(AccountStatus) as string[]).includes(value);
}
