import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Group } from '../types/groups';

type GroupsTableProps = {
  groups: Group[];
  loading?: boolean;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
};

export function GroupsTable({ groups, loading, onEdit, onDelete }: GroupsTableProps) {
  if (loading) {
    return <p className="py-6 text-sm text-slate-500">Loading groups…</p>;
  }

  if (groups.length === 0) {
    return <p className="py-6 text-sm text-slate-500">No groups found. Add a group to get started.</p>;
  }

  return (
    <Table className="border border-slate-200 bg-white shadow-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Number</TableHead>
          <TableHead>Tournament</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => (
          <TableRow key={group.id}>
            <TableCell>{group.name ?? `Group ${group.number}`}</TableCell>
            <TableCell>{group.number}</TableCell>
            <TableCell>{group.Tournament?.name ?? group.tournament_id}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(group)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(group)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
