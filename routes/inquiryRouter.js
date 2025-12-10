import express from 'express';
import { addInquiry, getInquiries, deleteInquiry, updateInquiry} from '../controllers/inquiryController.js';

const inquiryRouter = express.Router();

inquiryRouter.post('/add', addInquiry);
inquiryRouter.get('/get', getInquiries);
inquiryRouter.delete('/delete/:id', deleteInquiry);
inquiryRouter.put('/update/:id', updateInquiry);

export default inquiryRouter;