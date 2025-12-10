import express from 'express';
import { addInquiry } from '../controllers/inquiryController.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/add', addInquiry);

export default inquiryRouter;