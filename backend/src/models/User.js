import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    phone: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: ""
    },
    profilePic: {
        type: String,
        default: "",
    },
    location: {
        type: String, 
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
}, {timestamps: true});

// Pre Hook -> Before storing the users to the database 
// before I wish to hash their passwords

userSchema.pre("save", async function (next){

    if(!this.isModified("password")) return next();

    try {

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        next();

    } catch (error) {
        next(error);
    } 
});

userSchema.methods.matchPass = async function (pass) {
    const password = await bcrypt.compare(pass,this.password);
    return password;
}

const User = mongoose.model("User", userSchema);

export default User;