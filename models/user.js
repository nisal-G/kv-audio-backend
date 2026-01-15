import mongoose from "mongoose";

const userSchema = new mongoose.Schema ({
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
    },
    role : {
        type : String,
        required : true,
        default : "Customer"
    },
    firstName : {
        type : String,  
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },

    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    },
    
    profilePicture : {
        type : String,
        required : true,
        default : "https://static.vecteezy.com/system/resources/thumbnails/036/280/650/small_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
    },

    emailVerified : {
        type : Boolean,
        required : true,
        default : false
    }
});

const User = mongoose.model("User", userSchema);

export default User;
  