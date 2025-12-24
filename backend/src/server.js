import express from "express"
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors"
import productRouter from "./routes/product.router.js"
import { aj } from "../lib/arcjet.js";
const app = express();

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cors());
app.use(helmet()); // we can get header through which we can secure our app by setting various http headers
app.use(morgan("dev")) //log the requests
app.set("trust proxy", true);

app.use(async (req, res, next) => {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    return res.status(429).json({ message: "Blocked by Arcjet" });
  }

  next();
});


app.use("/api/products", productRouter) 



export { app };
