import express, { Router } from 'express';
import { createElectionController, getElectionController, castVoteController, updateElectionStatusController } from '../controllers/Election';
import { checkCookie, createCookieData, updateCookie } from '../controllers/cookies';

const ElectionRouter: Router = express.Router();

ElectionRouter.post('/create', createElectionController);

ElectionRouter.get('/:electionUrl', createCookieData, getElectionController);

ElectionRouter.post('/:electionUrl/vote', checkCookie, castVoteController, updateCookie);

ElectionRouter.put('/:electionUrl/update', updateElectionStatusController);



export default ElectionRouter;
