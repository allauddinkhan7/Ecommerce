//user exist or or not
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
export const verifyJwt = async (req, _, next) => { //not using res so put _ instead
  try {
    const token = req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
  
    if (!token) {
      throw new Error("Unauthorized req");
    }
    //if (token)
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id) //ref to this _id -> user.model.js -> jwt.sign({_id})
      .select("-password -refreshToken");
  
      if (!user) {
          throw new Error("invalid Access Token");
      }
  
      //add that Object 
      req.user = user;
      next()
  } catch (error) {
    throw new Error(error?.message || "Invalid access token");
    
  }
};
