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



//apply arcjet rate-limiting to all routes
app.use(async (req, res, next) => {
    try {
      const decision = await aj.protect(req, {
        requested: 1, // specifies that each req consumes 1 token
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          res.status(429).json({ error: "Rate limit exceeded" });
        } else if (decision.reason.isBot()) {
          res.status(403).json({ error: "bOT detection denied" });
        } else {
          res.status(403).json({ error: "Forbidden" });
        }
      } else {
        return;
      }

      //check for spoofed bots
      if (decision.results.some(isSpoofedBot)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      } 

      next();
    } catch (error) {
        console.log("error in apply arcjet rate-limiting", error)
        next(error)
    }
})

app.use("/api/products", productRouter) //   /api/auth/authRoutes



export { app };
