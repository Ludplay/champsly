import type { Player } from '@/features/players/types/players';

// This file defines the data types for tournaments in our application.
// We use TypeScript interfaces to ensure type safety and better code readability.

export interface Tournament {
  id: number;
  name: string;
  groups_quantity: number;
  phases_quantity: number;
  status: string;
  Players?: Player[];
}

export interface TournamentInput {
  name: string;
  groups_quantity: number;
  phases_quantity: number;
  status: string;
  players?: Array<{ player_id: number }>;
}