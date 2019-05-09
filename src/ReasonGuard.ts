export type ReasonGuard<FROM, TO extends FROM> = (input: FROM, output: Error[], confirmations: string[]) => input is TO;
