import type { Tournament } from '@/features/tournaments/types/tournaments';

export interface Phase {
  id: number;
  tournament_id: number;
  name: string;
  status: string;
  number: number | null;
  tournament: string;
  Tournament?: Tournament;
}

export interface PhaseInput {
  tournament_id: number;
  name: string;
  status: string;
  number: number;
}
