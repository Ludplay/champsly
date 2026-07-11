const { z } = require('zod');

const createPlayerSchema = z.object({
    name: z.string().trim().min(1, 'name is required'),
    extra: z.string().trim().optional(),
});

const updatePlayerSchema = createPlayerSchema.partial();

module.exports = {
    createPlayerSchema,
    updatePlayerSchema,
};
