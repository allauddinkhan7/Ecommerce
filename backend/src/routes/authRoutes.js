import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
const router = Router();


//route                        middleware, controller
// router.route("/register").post(verifyJwt,registerUser)
router.route("/register").post(registerUser)

export default router;
  