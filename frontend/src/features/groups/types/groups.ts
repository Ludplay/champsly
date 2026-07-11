import type { Player } from '@/features/players/types/players';
import type { Tournament } from '@/features/tournaments/types/tournaments';

export interface Group {
  id: number;
  tournament_id: number;
  name: string | null;
  number: number;
  Players?: Player[];
  Tournament?: Tournament;
}

export interface GroupInput {
  tournament_id: number;
  name?: string;
  number: number;
  players?: Array<{ player_id: number }>;
}
