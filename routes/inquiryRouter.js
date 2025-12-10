import express from 'express';
import { addInquiry, getInquiries, deleteInquiry} from '../controllers/inquiryController.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/add', addInquiry);
inquiryRouter.get('/get', getInquiries);
inquiryRouter.delete('/delete/:id', deleteInquiry);

export default inquiryRouter;