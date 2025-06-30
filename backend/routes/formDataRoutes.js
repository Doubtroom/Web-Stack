import express from 'express'
const router = express.Router();
import { getColleges, getBranches, getStudyTypes } from '../controllers/formDataController.js'

router.get('/colleges', getColleges);
router.get('/branches', getBranches);
router.get('/study-types', getStudyTypes);

export default router; 