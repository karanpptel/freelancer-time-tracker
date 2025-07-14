import express from "express";
import { createTimeEntry, getTimeEntries, getSummaryByProject, timeEntriesToCSV, timeEntriesToPDF } from "../controllers/timeEntryController.js";
import { protect } from "../middleware/authMiddleware.js";

const timeEntryRouter = express.Router();


timeEntryRouter.post('/create', protect, createTimeEntry);
timeEntryRouter.get('/', protect, getTimeEntries);
timeEntryRouter.get('/summary', protect, getSummaryByProject);
timeEntryRouter.get('/export/csv', protect, timeEntriesToCSV);
timeEntryRouter.get('/export/pdf', protect, timeEntriesToPDF);

export default timeEntryRouter