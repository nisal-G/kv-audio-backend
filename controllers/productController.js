import Product from "../models/product.js";

export function addProducts (req, res) {

   console.log(req.user)

   if (req.user == null) {
    res.status(401).json({message : "Please Logging and try again"});
    return;
   }

   if(req.user.role != "admin") {
    res.status(403).json( {message : "You are not authorized to perform this action !!"});
    return;
   }

    const data = req.body; 
    const newPoduct = new Product(data);

    newPoduct.save()
    .then(()=> {
         res.json({message : "Product saved Successfully"})
    }
    ).catch((error) => {
        res.status(500).json({error : "Product addition failed"})
    })
} 