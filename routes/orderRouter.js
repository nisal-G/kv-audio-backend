import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import e from 'cors';

const orderRouter = express.Router();

orderRouter.post('/', createOrder)

export default orderRouter;