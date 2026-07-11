const express = require('express');
const router = express.Router();

const validateMiddleware = require('../../middlewares/validate.middleware');
const { createPlayerSchema, updatePlayerSchema } = require('../../schemas/player.schema');
const { createTournamentSchema, updateTournamentSchema, generateGroupsPhaseMatchesSchema } = require('../../schemas/tournament.schema');
const { createPhaseSchema, updatePhaseSchema } = require('../../schemas/phase.schema');
const { createGroupSchema, updateGroupSchema } = require('../../schemas/group.schema');
const { createMatchSchema, updateMatchSchema } = require('../../schemas/match.schema');

// Players
const getPlayersController = require('../../../../controllers/players/get-players.ctrl');
const createPlayerController  = require('../../../../controllers/players/create-player.ctrl');
const readPlayerController = require('../../../../controllers/players/read-player.ctrl');
const updatePlayerController = require('../../../../controllers/players/update-player.ctrl');
const deletePlayerController = require('../../../../controllers/players/delete-player.ctrl');

// Tournaments
const getTournamentsController = require('../../../../controllers/tournaments/get-tournaments.ctrl');
const createTournamentController = require('../../../../controllers/tournaments/create-tournament.ctrl');
const readTournamentController = require('../../../../controllers/tournaments/read-tournament.ctrl');
const updateTournamentController = require('../../../../controllers/tournaments/update-tournament.ctrl');
const deleteTournamentController = require('../../../../controllers/tournaments/delete-tournament.ctrl');

// Phases
const getPhasesController = require('../../../../controllers/phases/get-phases.ctrl');
const createPhaseController = require('../../../../controllers/phases/create-phase.ctrl');
const readPhaseController = require('../../../../controllers/phases/read-phase.ctrl');
const updatePhaseController = require('../../../../controllers/phases/update-phase.ctrl');
const deletePhaseController = require('../../../../controllers/phases/delete-phase.ctrl');
const generateGroupsPhaseMatchesController = require('../../../../controllers/phases/generate-groups-phase-matches.ctrl');

// Groups
const getGroupsController = require('../../../../controllers/groups/get-groups.ctrl');
const getTournamentGroupsController = require('../../../../controllers/groups/get-tournament-groups.ctrl');
const createGroupController = require('../../../../controllers/groups/create-group.ctrl');
const readGroupController = require('../../../../controllers/groups/read-group.ctrl');
const updateGroupController = require('../../../../controllers/groups/update-group.ctrl');
const deleteGroupController = require('../../../../controllers/groups/delete-group.ctrl');

// Matches
const getMatchsController = require('../../../../controllers/matchs/get-matchs.ctrl');
const getTournamentMatchsController = require('../../../../controllers/matchs/get-tournament-matchs.ctrl');
const createMatchController = require('../../../../controllers/matchs/create-match.ctrl');
const readMatchController = require('../../../../controllers/matchs/read-match.ctrl');
const updateMatchController = require('../../../../controllers/matchs/update-match.ctrl');
const deleteMatchController = require('../../../../controllers/matchs/delete-match.ctrl');

router.get('/', (req) => {
    req.log.info('here at index');
});

// Player routes
router.get('/get-players', getPlayersController);
router.post('/player', validateMiddleware(createPlayerSchema), createPlayerController);
router.get('/player/:id', readPlayerController);
router.put('/player/:id', validateMiddleware(updatePlayerSchema), updatePlayerController);
router.delete('/player/:id', deletePlayerController);

// Tournament routes
router.get('/get-tournaments', getTournamentsController);
router.post('/tournament', validateMiddleware(createTournamentSchema), createTournamentController);
router.get('/tournament/:id', readTournamentController);
router.put('/tournament/:id', validateMiddleware(updateTournamentSchema), updateTournamentController);
router.delete('/tournament/:id', deleteTournamentController);

// Phase routes
router.get('/get-phases', getPhasesController);
router.post('/phase', validateMiddleware(createPhaseSchema), createPhaseController);
router.get('/phase/:id', readPhaseController);
router.put('/phase/:id', validateMiddleware(updatePhaseSchema), updatePhaseController);
router.delete('/phase/:id', deletePhaseController);
router.post('/tournament/generate-groups-matches', validateMiddleware(generateGroupsPhaseMatchesSchema), generateGroupsPhaseMatchesController);

// Group routes
router.get('/get-groups', getGroupsController);
router.get('/tournament/:tournamentId/groups', getTournamentGroupsController);
router.post('/group', validateMiddleware(createGroupSchema), createGroupController);
router.get('/group/:id', readGroupController);
router.put('/group/:id', validateMiddleware(updateGroupSchema), updateGroupController);
router.delete('/group/:id', deleteGroupController);

// Match routes
router.get('/get-matchs', getMatchsController);
router.get('/tournament/:tournamentId/matchs', getTournamentMatchsController);
router.post('/match', validateMiddleware(createMatchSchema), createMatchController);
router.get('/match/:id', readMatchController);
router.put('/match/:id', validateMiddleware(updateMatchSchema), updateMatchController);
router.delete('/match/:id', deleteMatchController);


/* *** TESTS *** */
router.get('/test', (req, res) => {
    const users = [
        { name: 'Alice', email: 'Alice@example.com', role: 'admin' },
        { name: 'Bob', email: 'Bob@example.com', role: 'user' },
        { name: 'Charlie', email: 'Charlie@example.com', role: 'user' },
        { name: 'David', email: 'David@example.com', role: 'user' },
        { name: 'Eve', email: 'Eve@example.com', role: 'user' },
        { name: 'Frank', email: 'Frank@example.com', role: 'user' },
        { name: 'Grace', email: 'Grace@example.com', role: 'user' },
        { name: 'Heidi', email: 'Heidi@example.com', role: 'user' }
    ];

    res.status(200).json(users);
});


/* *** END TESTS *** */

module.exports = router;
