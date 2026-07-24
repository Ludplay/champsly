const { z } = require('zod');

const createPhaseSchema = z.object({
    tournament_id: z.number().int().positive(),
    name: z.string().trim().min(1, 'name is required'),
    status: z.string().trim().min(1, 'status is required'),
    number: z.number().int().positive().optional(),
});

const updatePhaseSchema = createPhaseSchema.partial();

module.exports = {
    createPhaseSchema,
    updatePhaseSchema,
};

export {};
