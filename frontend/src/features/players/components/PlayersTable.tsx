import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Player } from '../types/players'

type PlayersTableProps = {
  players: Player[]
  loading?: boolean
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayersTable({ players, loading, onEdit, onDelete }: PlayersTableProps) {
  if (loading) {
    return <p className="py-6 text-sm text-slate-500">Loading players…</p>
  }

  if (players.length === 0) {
    return <p className="py-6 text-sm text-slate-500">No players found. Add a player to get started.</p>
  }

  return (
    <Table className="border border-slate-200 bg-white shadow-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell>{player.name}</TableCell>
            <TableCell className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(player)}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(player)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
