import Product from "../models/product.js";

export async function addProducts (req, res) {

   console.log(req.user)

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
        const products = await Product.find();
        res.json(products);

    } catch (error) {
        res.status(500).json({message: "Failed to fetch products. Please try again."});
    }
}