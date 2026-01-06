import express from "express";
import { addProducts, getProducts, updateProduct, deleteProduct, getProductByKey } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", addProducts);
productRouter.get("/get/:key", getProductByKey);
productRouter.get("/get", getProducts);
productRouter.put("/update/:key", updateProduct);
productRouter.delete("/delete/:key", deleteProduct);

export default productRouter;