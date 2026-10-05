import { useCallback, useEffect, useState } from 'react';

import type { Group, GroupInput } from '../types/groups';
import {
  createGroup as createGroupRequest,
  deleteGroup as deleteGroupRequest,
  getGroups as getGroupsRequest,
  getGroupsByTournament as getGroupsByTournamentRequest,
  updateGroup as updateGroupRequest,
} from '../services/groups-api';

export function useGroups(tournamentId?: number, options?: { skipIfNoTournamentId?: boolean }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (tournamentId == null) {
      if (options?.skipIfNoTournamentId) {
        setGroups([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getGroupsRequest();
        setGroups(data);
      } catch (err) {
        setError('Unable to load groups. Please try again.');
      } finally {
        setLoading(false);
      }

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getGroupsByTournamentRequest(tournamentId);
      setGroups(data);
    } catch (err) {
      setError('Unable to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId, options?.skipIfNoTournamentId]);

  useEffect(() => {
    void fetchGroups();
  }, [fetchGroups]);

  // Background refresh: replaces the list without toggling `loading`, so the page doesn't flash.
  const refreshGroups = useCallback(async () => {
    if (tournamentId == null) {
      return;
    }

    try {
      const data = await getGroupsByTournamentRequest(tournamentId);
      setGroups(data);
    } catch {
      // Keep showing the current groups; the next refresh or reload will catch up.
    }
  }, [tournamentId]);

  const createGroup = useCallback(async (input: GroupInput) => {
    setLoading(true);
    setError(null);

    try {
      const group = await createGroupRequest(input);
      setGroups((current) => [...current, group]);
      return group;
    } catch (err) {
      setError('Unable to create the group. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGroup = useCallback(async (id: number, input: GroupInput) => {
    setLoading(true);
    setError(null);

    try {
      const group = await updateGroupRequest(id, input);
      setGroups((current) => current.map((item) => (item.id === group.id ? group : item)));
      return group;
    } catch (err) {
      setError('Unable to update the group. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGroup = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await deleteGroupRequest(id);
      setGroups((current) => current.filter((group) => group.id !== id));
    } catch (err) {
      setError('Unable to delete the group. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    refreshGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
