import express from "express";
import { addProducts } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", addProducts);

export default productRouter;