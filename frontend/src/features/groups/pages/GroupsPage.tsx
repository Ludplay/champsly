import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CreateGroupPage } from './CreateGroupPage';
import { EditGroupPage } from './EditGroupPage';
import { GroupsTable } from '../components/GroupsTable';
import { useGroups } from '../hooks/use-groups';
import type { GroupInput } from '../types/groups';
import type { Group } from '../types/groups';

export default function GroupsPage() {
  const { groups, loading, error, createGroup, updateGroup, deleteGroup } = useGroups();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const editTarget = useMemo(() => selectedGroup, [selectedGroup]);

  const openCreate = () => {
    setFormError(null);
    setSelectedGroup(null);
    setMode('create');
  };

  const openEdit = (group: Group) => {
    setFormError(null);
    setSelectedGroup(group);
    setMode('edit');
  };

  const closeForm = () => {
    setFormError(null);
    setSelectedGroup(null);
    setMode('list');
  };

  const handleCreate = async (input: GroupInput) => {
    setFormError(null);

    if (!input.tournament_id) {
      setFormError('Tournament is required.');
      return;
    }

    try {
      await createGroup(input);
      closeForm();
    } catch (err) {
      setFormError('Could not save the new group.');
    }
  };

  const handleUpdate = async (input: GroupInput) => {
    if (!selectedGroup) {
      setFormError('No group selected for editing.');
      return;
    }

    try {
      await updateGroup(selectedGroup.id, input);
      closeForm();
    } catch (err) {
      setFormError('Could not update the group.');
    }
  };

  const handleDelete = async (group: Group) => {
    await deleteGroup(group.id);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Groups</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Manage group assignments</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create and edit groups while assigning players and linking them to tournaments.</p>
        </div>
        <Button onClick={openCreate}>Create group</Button>
      </div>

      {mode === 'create' ? (
        <CreateGroupPage onCreate={handleCreate} onCancel={closeForm} loading={loading} error={formError ?? error} />
      ) : null}

      {mode === 'edit' && editTarget ? (
        <EditGroupPage group={editTarget} onUpdate={handleUpdate} onCancel={closeForm} loading={loading} error={formError ?? error} />
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Group list</h2>
            <p className="text-sm text-slate-500">See groups and edit their settings or assigned players.</p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <GroupsTable groups={groups} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      </section>
    </main>
  );
}
