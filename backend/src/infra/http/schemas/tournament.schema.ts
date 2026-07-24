const { z } = require('zod');

const tournamentPlayerSchema = z.object({
    player_id: z.number().int().positive(),
});

const createTournamentSchema = z.object({
    name: z.string().trim().min(1, 'name is required'),
    groups_quantity: z.number().int().positive(),
    phases_quantity: z.number().int().positive(),
    status: z.string().trim().min(1, 'status is required'),
    players: z.array(tournamentPlayerSchema).min(1, 'at least one player is required'),
});

const updateTournamentSchema = z.object({
    name: z.string().trim().min(1).optional(),
    groups_quantity: z.number().int().positive().optional(),
    phases_quantity: z.number().int().positive().optional(),
    status: z.string().trim().min(1).optional(),
});

const generateGroupsPhaseMatchesSchema = z.object({
    id: z.number().int().positive(),
});

module.exports = {
    createTournamentSchema,
    updateTournamentSchema,
    generateGroupsPhaseMatchesSchema,
};

export {};
