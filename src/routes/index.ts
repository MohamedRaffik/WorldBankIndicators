import { Router } from 'express';
import { searchIndicators, getAllTopics, getAllGeneralSubjects, getIndicatorInformation } from '../controllers';

const router = Router();

router.get('/query', searchIndicators);
router.get('/topics', getAllTopics);
router.get('/topics/:topic_id/generalsubjects', getAllGeneralSubjects);
router.get('/indicator/:indicator_id/info', getIndicatorInformation);

export default router;