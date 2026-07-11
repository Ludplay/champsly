const { z } = require('zod');

const createGroupSchema = z.object({
    tournament_id: z.number().int().positive(),
    name: z.string().trim().min(1).optional(),
    number: z.number().int().positive(),
});

const updateGroupSchema = createGroupSchema.partial();

module.exports = {
    createGroupSchema,
    updateGroupSchema,
};
