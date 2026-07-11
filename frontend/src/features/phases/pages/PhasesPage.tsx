import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CreatePhasePage } from './CreatePhasePage';
import { EditPhasePage } from './EditPhasePage';
import { PhasesTable } from '../components/PhasesTable';
import { usePhases } from '../hooks/use-phases';
import type { PhaseInput } from '../types/phases';
import type { Phase } from '../types/phases';

export default function PhasesPage() {
  const { phases, loading, error, createPhase, updatePhase, deletePhase } = usePhases();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const editTarget = useMemo(() => selectedPhase, [selectedPhase]);

  const openCreate = () => {
    setFormError(null);
    setSelectedPhase(null);
    setMode('create');
  };

  const openEdit = (phase: Phase) => {
    setFormError(null);
    setSelectedPhase(phase);
    setMode('edit');
  };

  const closeForm = () => {
    setFormError(null);
    setSelectedPhase(null);
    setMode('list');
  };

  const handleCreate = async (input: PhaseInput) => {
    setFormError(null);

    if (!input.tournament_id) {
      setFormError('Tournament is required.');
      return;
    }

    try {
      await createPhase(input);
      closeForm();
    } catch (err) {
      setFormError('Could not save the new phase.');
    }
  };

  const handleUpdate = async (input: PhaseInput) => {
    if (!selectedPhase) {
      setFormError('No phase selected for editing.');
      return;
    }

    try {
      await updatePhase(selectedPhase.id, input);
      closeForm();
    } catch (err) {
      setFormError('Could not update the phase.');
    }
  };

  const handleDelete = async (phase: Phase) => {
    await deletePhase(phase.id);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Phases</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Manage phase setup</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create and update phases for tournaments.</p>
        </div>
        <Button onClick={openCreate}>Create phase</Button>
      </div>

      {mode === 'create' ? (
        <CreatePhasePage onCreate={handleCreate} onCancel={closeForm} loading={loading} error={formError ?? error} />
      ) : null}

      {mode === 'edit' && editTarget ? (
        <EditPhasePage phase={editTarget} onUpdate={handleUpdate} onCancel={closeForm} loading={loading} error={formError ?? error} />
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Phase list</h2>
            <p className="text-sm text-slate-500">See phases and edit their tournament assignment.</p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <PhasesTable phases={phases} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      </section>
    </main>
  );
}
