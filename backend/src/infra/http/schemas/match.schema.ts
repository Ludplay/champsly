const { z } = require('zod');

const createMatchSchema = z.object({
    phase_id: z.number().int().positive(),
    group_id: z.number().int().positive().optional(),
    round_number: z.number().int().positive(),
    player1_id: z.number().int().positive(),
    player2_id: z.number().int().positive(),
    status: z.string().trim().min(1, 'status is required'),
}).refine((data: { player1_id: number; player2_id: number }) => data.player1_id !== data.player2_id, {
    message: 'player1_id and player2_id must be different',
    path: ['player2_id'],
});

const updateMatchSchema = z.object({
    phase_id: z.number().int().positive().optional(),
    group_id: z.number().int().positive().optional(),
    round_number: z.number().int().positive().optional(),
    player1_id: z.number().int().positive().optional(),
    player2_id: z.number().int().positive().optional(),
    status: z.string().trim().min(1).optional(),
    winner_player_id: z.number().int().positive().nullable().optional(),
    player1_score: z.number().int().nonnegative().optional(),
    player2_score: z.number().int().nonnegative().optional(),
});

module.exports = {
    createMatchSchema,
    updateMatchSchema,
};

export {};
