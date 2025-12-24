import { Router } from "express";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controllers.js";
const router = Router();

router.route("/getProducts").get(getProducts)

router.route("/createProduct").post(createProduct)

router.route("/getProduct/:id").get(getProduct) 

router.route("/updateProduct/:id").put(updateProduct)

router.route("/deleteProduct/:id").delete(deleteProduct) 


export default router;
  