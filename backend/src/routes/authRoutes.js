import { Router } from "express";
import { loginUser, logOutUser, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();


//route                        middleware, controller
// router.route("/register").post(verifyJwt,registerUser)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser);
router.route("/logout").post(logOutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
  