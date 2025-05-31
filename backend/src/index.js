import { app } from "./app.js";
import connectDB from "./db/index.js";
import "dotenv/config";
const port = process.env.PORT || 4000;
 
connectDB()
  .then(() => {
   app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is runing at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB conn is failed", err);
  });
