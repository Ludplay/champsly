import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Tournament } from '../types/tournaments';

// Props for the TournamentsTable component.
// Defines what data and functions the table needs.
type TournamentsTableProps = {
  tournaments: Tournament[];
  loading?: boolean;
  onEdit: (tournament: Tournament) => void;
  onDelete: (tournament: Tournament) => void;
};

// Component to display a table of tournaments.
// Shows tournament details and provides edit/delete actions.
export function TournamentsTable({ tournaments, loading, onEdit, onDelete }: TournamentsTableProps) {
  // If loading, show a loading message.
  if (loading) {
    return <p className="py-6 text-sm text-slate-500">Loading tournaments…</p>;
  }

  // If no tournaments, show an empty state message.
  if (tournaments.length === 0) {
    return <p className="py-6 text-sm text-slate-500">No tournaments found. Add a tournament to get started.</p>;
  }

  // Render the table with tournament data.
  return (
    <Table className="border border-slate-200 bg-white shadow-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Groups</TableHead>
          <TableHead>Phases</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tournaments.map((tournament) => (
          <TableRow key={tournament.id}>
            <TableCell>{tournament.name}</TableCell>
            <TableCell>{tournament.groups_quantity}</TableCell>
            <TableCell>{tournament.phases_quantity}</TableCell>
            <TableCell>{tournament.status}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(tournament)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(tournament)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}