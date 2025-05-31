// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
import Redis from "ioredis";
import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
import {redis} from "../lib/redis.js"
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const userForToken = await User.findById(userId);
    const accessToken = userForToken.generateAccessToken();
    const refreshToken = userForToken.generateRefreshToken();

    //save refresh token
    userForToken.refreshToken = refreshToken;
    await userForToken.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
  } catch (error) {
    return res.status(400).json({
      msg: "something went wrong while generateAccessAndRefreshTokens",
    });
  }
};


const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60) //7days
}
const setCookie = async (res, accessToken, refreshToken ) => {
  res.cookie("accessToken",  accessToken,{httpOnly:true, sercure:process.env.NODE_ENV === 'production', sameSite:"strict", maxAge:15*60*1000})
  res.cookie("refreshToken",  refreshToken,{httpOnly:true, sercure:process.env.NODE_ENV === 'production', sameSite:"strict", maxAge:7*24*60*60*1000})
}
const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if ([userName, email, password].some((field) => !field?.trim())) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    //check if already exists,
    const isUserExist = await User.findOne({
      $or: [
        //give values to check
        { userName },
        { email },
      ],
    });

    if (isUserExist) res.status(400).json({ msg: "User already exists" });
    //create user
    const newUser = await User.create({
      userName: userName.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });



    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      newUser._id
    );
    //save the refreshToken to the redis database
    await storeRefreshToken(newUser._id, refreshToken)

    setCookie(res, accessToken, refreshToken )

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      return res.status(500).json({ msg: "Failed to create user" });
    }

    return res.status(201).json({
      user: createdUser,
      msg: "User created successfully",
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    //  get user details from FE,
    const { userName, email, password } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required" });
    }

    // check if user exists,
    const existedUser = await User.findOne({
      $or: [
        //give values to check
        { email },
      ],
    });

    if (!existedUser) {
      return res.status(400).json({ msg: "user not found " });
    }

    //verify password
    const isPasswordValid = await existedUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    // generate access amd refresh token,
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      existedUser._id
    );
    const loggedInUser = await User.findById(existedUser._id).select(
      "-password -refreshToken"
    );
    //send it using cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken, //sending accessToken refreshToken again for FE needs may FE wants to store it in localStorage
        msg: "User logged In Successfully",
      });
  } catch (error) {
    console.error("Error in LoginUser:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

const logOutUser = async (req, res, next) => {
  /*
  findUser but we don't have access to user in this method
  so we will use middleware i.e auth.middleware.js in which we will verify user token if its verified we will add an Object xyz in req
  clear cookie first and reset refresh Token
  */

  try {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true, // we will get the updated value in response that is undefined
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ msg: "User logged Out" });
  } catch (error) {
    console.error("Error in LoginUser:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// const refreshAccessToken = asyncHandler(async (req, res) => {
//   const incomingRefreshToken =
//     (await req.cookies.refreshToken) || req.body.refreshToken;
//   if (!incomingRefreshToken) {
//     throw new ApiError(401, "UnAuthorized request");
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const user = await User.findById(decodedToken?._id); // we stored _id when generateRefreshToken() so we have access to it
//     if (!user) {
//       throw new ApiError(400, "Invalid refresh Token");
//     }
//     if (incomingRefreshToken !== user?.refreshToken)
//       throw new ApiError(401, "Refresh token is expired or used");

//     const { accessToken, newRefreshToken } =
//       await generateAccessAndRefreshTokens(user._id);
//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     return res
//       .status(200)
//       .cookie("accessToken", accessToken, options)
//       .cookie("newRefreshToken", newRefreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           {
//             accessToken,
//             refreshToken: newRefreshToken,
//           },
//           "Token refreshed"
//         )
//       );
//   } catch (error) {
//     throw new ApiError(401, error?.message || "failed refreshing token");
//   }
// });

// const getCurrentUser = asyncHandler(async (req, res) => {
//   console.log("getCurrentUser",req)
//   return res
//     .status(200)
//     .json(new ApiResponse(200, req.user, "current user fetched successfully"));
// });

// const changeCurrentPassword = asyncHandler(async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   const user = await User.findById(req.user?._id); //user?._id from authMiddleware

//   const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

//   if (!isPasswordCorrect) {
//     throw new ApiError(400, "Invalid Password");
//   }

//   user.password = newPassword;

//   await user.save({ validateBeforeSave: false });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "password updated successfully"));
// });

// const updateUser = asyncHandler(async (req, res) => {
//   const { fullName, email } = req.body;
//   if (!fullName || !email) {
//     throw new ApiError(400, "All fields required");
//   }

//   const user = await User.findByIdAndUpdate(
//     //id
//     req.user?._id, //find user
//     //req.body
//     {
//       $set: {
//         fullName: fullName,
//         email: email,
//       },
//     },
//     {
//       new: true, // we will get the updated value in response
//     }
//   ).select("-password");
//   return res.status(200).json(new ApiResponse(200, {}, "User updated"));
// });
// const deleteUser = asyncHandler(async (req, res) => {
//   const { id } = req.body;
//   const deletedUser = await User.findByIdAndDelete(id);
//   if (!deletedUser) {
//     throw new ApiError(400, "user not found");
//   }
//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "user deleted successully"));
// });

// const updateUserAvatar = asyncHandler(async (res, req) => {
//   const avatarLocalPath = req.file?.path;
//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is missing");
//   }

//   const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
//   if (!uploadedAvatar.url) {
//     throw new ApiError(400, "Error uploading Avatar");
//   }

//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         avatar: uploadedAvatar.url,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res.status(200).json(new ApiResponse(200, user, "Avatar updated"));
// });

// const updateCoverImage = asyncHandler(async (res, req) => {
//   const coverImagePath = req.file?.path;
//   if (!coverImagePath) {
//     throw new ApiError(400, "cover image file is missing");
//   }
//   const coverImage = await uploadOnCloudinary(coverImagePath);
//   if (!coverImage.url) {
//     throw new ApiError(400, "Error uploading cover image");
//   }
//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         coverImage: coverImage.url,
//       },
//     },
//     { new: true }
//   ).select("-password");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "cover image updated"));
// });

// const getUserChannelProfile = asyncHandler(async (req, res) => {
//   //we want channel profile so we go that url
//   const { userName } = req.params;
//   if (!userName?.trim()) {
//     throw new ApiError(400, "userName is missing");
//   }

//   const channel = await User.aggregate([
//     //piplines
//     //filtering document
//     {
//       $match: {
//         userName: userName?.toLowerCase(),
//       },
//     },
//     //we got the User ex: Chai or code now count subscribers
//     //joining Documents => $lookUp
//     //how many subscribers
//     {
//       $lookup: {
//         from: "subscriptions", //-> subscription.model.js when MongiDB stores it lowerCase and plural form
//         localField: "_id",
//         foreignField: "channel", //choose channel and count documents we will get subscribers
//         as: "subscribers",
//       },
//     },
//     //how many channels did I subscribed
//     {
//       $lookup: {
//         from: "subscriptions",
//         localField: "_id",
//         foreignField: "subscriber", //select subcriber value i.e moiz and its present in Document1 and Documents. so moiz subscribed 2 channels
//         as: "subscribedTo",
//       },
//     },
//     //adding fields in User Object
//     {
//       $addFields: {
//         // it will keep old fields and will add the following one's
//         subscriberCount: {
//           $size: "$subscribers", //counting subscribers
//         },
//         channelsSubscribedToCount: {
//           $size: "$subscribedTo",
//         },
//         isSubscribed: {
//           $cond: {
//             //in subbscribers checking whether I'm present in it or not
//             if: { $in: [req.user?._id, "$subscribers.subscriber"] },
//             then: true,
//             else: false,
//           },
//         },
//       },
//     },
//     //filering what to pass to FE
//     {
//       $project: {
//         fullName: 1,
//         userName: 1,
//         email: 1,
//         avatar: 1,
//         coverImage: 1,
//         isSubscribed: 1,
//         subscriberCount: 1,
//         channelsSubscribedToCount: 1,
//       },
//     },
//   ]);
//   console.log("aggregate returns-------------", channel);
//   if (!channel?.length) {
//     throw new ApiError(404, "channel does not exist");
//   }
//   return res.status.json(
//     new ApiResponse(200, channel, "User channel Fetched Successfully")
//   );
// });

// const getUserHistory = asyncHandler(async (req, res) => {
//   const user = await User.aggregate([
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(req.user._id),
//       },
//     },
//     {
//       $lookup: {
//         from: "videos",
//         localField: "watchHistory",
//         foreignField: "_id",
//         as: "watchHistory",
//         pipeline: [
//           {
//             $lookup: {
//               from: "users",
//               localField: "owner",
//               foreignField: "_id",
//               as: "owner",
//               pipeline: [
//                 {
//                   $project: {
//                     fullName: 1,
//                     userName: 1,
//                     avatar: 1,
//                   },
//                 },
//               ],
//             },
//           },
//           //strucing data: lookup gives in array so take data out of that array and pass in obj to FE
//           {
//             $addFields: {
//               owner: {
//                 $first: "$owner ",
//               },
//             },
//           },
//         ],
//       },
//     },
//   ]);

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         user[0].watchHistory,
//         "watch history fetched successully"
//       )
//     );
// });

export {
  registerUser,
  loginUser,
  // logOutUser,
  // refreshAccessToken,
  // changeCurrentPassword,
  // updateUser,
  // deleteUser,
  // getCurrentUser,
  // updateUserAvatar,
  // updateCoverImage,
  // getUserChannelProfile,
  // getUserHistory,
};

/*
if no asyncHandler then use this code

export const registerUser = async (req, res) => {
  res.status(200).json({ message: "ok" });   
}; 


*/
