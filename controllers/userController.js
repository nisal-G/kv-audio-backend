import User from "../models/user.js";
import OTP from "../models/otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";

dotenv.config();

//Here configure nodemailer transport
const transport = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export function registerUser(req, res) {

    const data = req.body

    data.password = bcrypt.hashSync(data.password, 10)

    const newUser = new User(data)

    newUser.save().then(
        () => res.json({ message: "User registered successfully" })
    ).catch((error) => {
        res.status(500).json({ error: "User registration failed" })
    })
}


export function loggingUser(req, res) {

    const data = req.body

    User.findOne({
        email: data.email
    }).then(
        (user) => {
            if (user == null) {
                res.status(404).json({ error: "User not found" })
            } else {

                if (user.isBlocked) {
                    return res.status(403).json({ error: "Your Account is blocked. Please contact support." })
                    return;
                }

                const isPasswordCorrect = bcrypt.compareSync(data.password, user.password);

                if (isPasswordCorrect) {

                    const token = jwt.sign({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        profilePicture: user.profilePicture,
                        phone: user.phone,
                        emailVerified: user.emailVerified
                    }, process.env.JWT_SECRET)

                    res.json({ message: "Login Successful!", token: token, user: user })

                } else {
                    res.status(401).json({ error: "Login Failed" })
                }
            }
        }
    )
}

export function isItAdmin(req) {

    let isAdmin = false;
    if (req.user != null && req.user.role === "Admin") {
        isAdmin = true;
    }

    return isAdmin;
}


export function isItCustomer(req) {

    let isItCustomer = false;
    if (req.user != null && req.user.role === "Customer") {
        isItCustomer = true;
    }

    return isItCustomer;
}

export async function getAllUsers(req, res) {
    if (isItAdmin(req)) {
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


export async function blockOrUnblockUser(req, res) {
    if (isItAdmin(req)) {

        const email = req.params.email;

        if (isItAdmin(req)) {
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


export async function loginWithGoogle(req, res) {

    //https://www.googleapis.com/oauth2/v3/userinfo - to get user info from access token

    const accessToken = req.body.accessToken;
    console.log("Access Token:", accessToken);


    try {
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
                phone: user.phone,
                emailVerified: true
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
                isBlocked: false,
                emailVerified: userDetails.email_verified || false
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

// Send OTP to Email
export async function sendOTP(req, res) {

    // Check if user is authenticated
    if (req.user == null) {
        return res.status(401).json({ error: "Authentication required" });
    }

    // Use authenticated user's email
    const recipientEmail = req.user.email;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save or update OTP in database (upsert: update if exists, insert if not)
    try {
        await OTP.findOneAndUpdate(
            { email: recipientEmail },
            { otp: otp, createdAt: new Date() },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error saving OTP:', error);
        return res.status(500).json({ error: "Failed to generate OTP" });
    }

    // Create email message
    const message = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`
    };

    //transport is configured at the top of the file
    // Send email
    transport.sendMail(message, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
            res.status(500).json({ error: 'Failed to send OTP email' });
        } else {
            console.log('Email sent:', info.response);
            res.json({ message: 'OTP email sent successfully' });
        }
    });
}


export async function verifyOTP(req, res) {

    // Check if user is authenticated
    if (req.user == null) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const code = Number(req.body.code);

    const otp = await OTP.findOne({ email: req.user.email, otp: code });

    if (otp == null) {
        return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }
    if (otp.otp === code) {

        // Mark user's email as verified
        await User.updateOne({ email: req.user.email }, { emailVerified: true });
        // Delete the OTP after successful verification
        await OTP.deleteOne({ email: req.user.email });
        res.json({ message: "Email verified successfully" });
    } else {
        res.status(400).json({ error: "Invalid OTP. Please try again." });
    }
}


