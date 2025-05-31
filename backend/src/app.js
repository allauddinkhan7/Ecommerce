import express from "express"
const app = express();
// without these two middlewares we cannot read FE data from req.body
// configuring limit for incoming JSON allowing only 16kb
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))//extended-> when storing nested objects



import authRoutes from "./routes/authRoutes.js"
app.use("/api/auth", authRoutes) //   /api/auth/authRoutes



export { app };
