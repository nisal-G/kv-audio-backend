import Product from "../models/product.js";
import { isItAdmin } from "./userController.js";

export async function addProducts (req, res) {

   if (req.user == null) {
    res.status(401).json({message : "Please Logging and try again"});
    return;
   }

   if(req.user.role != "Admin") {
    res.status(403).json( {message : "You are not authorized to perform this action !!"});
    return;
   }

    const data = req.body; 
    const newPoduct = new Product(data);

    try{
        await newPoduct.save();
        res.status(201).json({message : "Product added successfully"});
    } catch (error) {
        res.status(500).json({error: "Product registrartion failed. Please try again."});
    }
}

export async function getProducts (req, res) {

    try {
        if(isItAdmin(req)) {
        const products = await Product.find();
        res.json(products);
        } else {
        const products = await Product.find({availability: true});
        res.json(products);
        }

    } catch (error) {
        res.status(500).json({message: "Failed to fetch products. Please try again."});
    }
}


export async function updateProduct(req, res) {

    try {
        if(isItAdmin(req)) {
            const key = req.params.key;
            const data = req.body;

            await Product.updateOne( { key : key }, data );

            res.json( { message : "Product updated successfully"} );
        } else {
            res.status(403).json( {message : "You are not authorized to perform this action !!"});
        }
    } catch (error) {
        res.status(500).json({message: "Failed to update product. Please try again."});
    }
}


export async function deleteProduct(req, res) {

    try {
        if(isItAdmin(req)) {
            const key = req.params.key;
            await Product.deleteOne( { key : key } );

            res.json( { message : "Product deleted successfully"} );
        } else {
            res.status(403).json( {message : "You are not authorized to perform this action !!"});
        }
    } catch (error) {
        res.status(500).json({message: "Failed to delete product. Please try again."});
    }
}