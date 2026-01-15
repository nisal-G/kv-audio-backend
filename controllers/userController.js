import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

export function registerUser (req, res) {

    const data = req.body

    data.password = bcrypt.hashSync(data.password, 10)

    const newUser = new User(data)

    newUser.save().then(
        ()=> res.json({message : "User registered successfully"})
    ).catch( (error) => {
        res.status(500).json({error : "User registration failed"})
    })   
}


export function loggingUser(req, res) {

    const data = req.body

    User.findOne( {
        email : data.email
    } ).then(
        (user) => {
            if(user == null) {
                res.status(404).json({error : "User not found"})
            } else {

                if(user.isBlocked) {
                    return  res.status(403).json({error : "Your Account is blocked. Please contact support."})
                    return;
                }

                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);

                if(isPasswordCorrect) {

                    const token = jwt.sign ({
                        firstName : user.firstName,
                        lastName : user.lastName,
                        email : user.email,
                        role : user.role,
                        profilePicture : user.profilePicture,
                        phone: user.phone
                    }, process.env.JWT_SECRET)

                    res.json({message: "Login Successful!", token : token, user: user})

                } else {
                    res.status(401).json({error: "Login Failed"})
                }             
            }
        }
    )
}

export function isItAdmin(req) {
    
    let isAdmin = false;
    if(req.user != null && req.user.role === "Admin") {
        isAdmin = true;
    }

    return isAdmin;
}


export function isItCustomer(req) {

    let isItCustomer = false;
    if(req.user != null && req.user.role === "Customer") {
        isItCustomer = true;
    }

    return isItCustomer;
}

export async function getAllUsers(req, res) {
    if(isItAdmin(req)) {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve users" });
        }
    } else {
        res.status(403).json({ error: "Access denied" });
    }
}


export async function blockOrUnblockUser(req, res)  {
    if(isItAdmin(req)) {

        const email = req.params.email;

        if(isItAdmin(req)) {
            try {
                const user = await User.findOne({ email: email });

            if (user === null) {
                return res.status(404).json({ error: "User not found" });
            }

            const isBlocked = !user.isBlocked; // Toggle the isBlocked status

            // Update the user's isBlocked status in the database
            await User.updateOne({ email: email }, { isBlocked: isBlocked });

            return res.json({ message: `User has been ${isBlocked ? "blocked" : "unblocked"}` });
            

            } catch (error) {
                return res.status(404).json({ error: "Failed to get User" });
            }

        } else {
            res.status(403).json({ error: "Access denied" });
        }

    }  
}


export async function getUser(req, res) {

    if (req.user != null) {
        try {
            const user = await User.findOne({ email: req.user.email });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve user data" });
        }
    } else {
        res.status(401).json({ error: "Authentication required" });
    }
}


export async function loginWithGoogle (req, res) {

    //https://www.googleapis.com/oauth2/v3/userinfo - to get user info from access token

    const accessToken = req.body.accessToken;
    console.log("Access Token:", accessToken);


    try{
    // Fetch user info from Google API
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    
    // Extract user details from response
    const userDetails = response.data;
    console.log("User Details:", userDetails);

    // Check if user already exists in database
    let user = await User.findOne({ email: userDetails.email });

    if (user) {
        // User exists, check if blocked
        if (user.isBlocked) {
            return res.status(403).json({ error: "Your Account is blocked. Please contact support." });
        }

        // Generate JWT token
        const token = jwt.sign({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            phone: user.phone
        }, process.env.JWT_SECRET);

        return res.json({ message: "Login Successful!", token: token, user: user });

    } else {
        // User doesn't exist, create new account
        const newUser = new User({
            firstName: userDetails.given_name || userDetails.name.split(' ')[0],
            lastName: userDetails.family_name || userDetails.name.split(' ')[1] || '',
            email: userDetails.email,
            password: bcrypt.hashSync(Math.random().toString(36), 10), // Random password for Google users
            profilePicture: userDetails.picture || '',
            address: 'Not Given',
            phone: 'Not Given',
            role: 'Customer',
            isBlocked: false
        });

        await newUser.save();

        // Generate JWT token for new user
        const token = jwt.sign({
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
            profilePicture: newUser.profilePicture,
            phone: newUser.phone
        }, process.env.JWT_SECRET);

        return res.json({ message: "User registered and logged in successfully!", token: token, user: newUser });
    }
    
} catch (error) {
    console.error("Error fetching user info from Google:", error);
    return res.status(500).json({ error: "Failed to Login with Google" });  
}
}