import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //when we search by username, it will be faster
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", //refers to the Product model
        },
      },
    ],
    //user role
    // 0->customer, 1->admin
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

//2. encrypt the password
userSchema.pre("save", async function (next) {
  // .pre is a middleware, it will run before saving the data and it will encrypt the password
  // its middleware so we have to call next() to move to next middleware
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});
//3. validate password  bcz we saved the password in encrypted form
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/*
 4. generate access token
 jwt.sign() is a function which takes 3 arguments 
  1. is payload, the data which we want to store in token like user id, email, username etc,
  2. is secret key, used to encrypt the data
  3. is options  used to set the expiry time of token
*/
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //payload
      _id: this._id,
      email: this.email,
      userName: this.userName,
      
    },
    process.env.ACCESS_TOKEN_SECRET, //secret key
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, //options
    }
  );
};

//5. generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, //secret key
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);