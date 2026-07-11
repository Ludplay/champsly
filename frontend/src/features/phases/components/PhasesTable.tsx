import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Phase } from '../types/phases';

type PhasesTableProps = {
  phases: Phase[];
  loading?: boolean;
  onEdit: (phase: Phase) => void;
  onDelete: (phase: Phase) => void;
};

export function PhasesTable({ phases, loading, onEdit, onDelete }: PhasesTableProps) {
  if (loading) {
    return <p className="py-6 text-sm text-slate-500">Loading phases…</p>;
  }

  if (phases.length === 0) {
    return <p className="py-6 text-sm text-slate-500">No phases found. Add a phase to get started.</p>;
  }

  return (
    <Table className="border border-slate-200 bg-white shadow-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Tournament</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Number</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {phases.map((phase) => (
          <TableRow key={phase.id}>
            <TableCell>{phase.tournament}</TableCell>
            <TableCell>{phase.name}</TableCell>
            <TableCell>{phase.number ?? '-'}</TableCell>
            <TableCell>{phase.status}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(phase)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(phase)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
