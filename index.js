import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import reviewRouter from "./routes/reviewRouter.js";

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    let token = req.header("Authorization")

    if (token != null) {
        token = token.replace("Bearer ", "")

        jwt.verify(token, process.env.JWT_SECRET, 
            (err, decoded) => {
                if(!err) {
                    req.user = decoded;
                }
            }
         ) 
    }
    next();
}) 


let mongoUrl = process.env.MONGO_URL;
 
mongoose.connect(mongoUrl)

let connection = mongoose.connection

connection.once("open", ()=> {
    console.log("MongoDB connection established succesfully")
})

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)
app.use("/api/reviews", reviewRouter)



app.listen(3000,()=> {
    console.log("Server is running on port 3000")   
});


console.log("Hello World")

//"email": "nisal2004@gmail.com",
//"password": "2004" customer

//"email": "nisal200421@gmail.com",
//"password": "2004", admin