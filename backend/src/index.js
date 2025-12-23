import connectDB from "./db/index.js";
import { app } from "./server.js";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is runing at ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB conn is failed", err);
  });
