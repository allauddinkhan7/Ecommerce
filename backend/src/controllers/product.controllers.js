import { sql } from "../db/index.js";

export const getProducts = async (req, res) => {
  try {
    const products = await sql`
            SELECT * FROM products
            ORDER BY created_at DESC
        `;
    console.log("products..............", products);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log("error fetching products", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, image, price } = req.body;
  if (!name || !image || !price) {
    return res
      .status(400)
      .json({ status: false, message: "All fields required" });
  }

  try {
    const newProduct = await sql`
            INSERT INTO products (name,image,price)
            VALUES (${name}, ${image}, ${price})
            RETURNING *
        `;
    console.log("new added product ...............", newProduct);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.log("error in creating product");
    res.status(500).json({ success: true, msg: error.message });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await sql`
            select * FROM products WHERE id = ${id}
        `;
    console.log("get product................", product);
    res.status(200).json({ success: true, data: product[0] });
  } catch (error) {
    console.log("error in getProduct", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { name, image, price } = req.body;
  const { id } = req.params;

  if (!name || !image || !price) {
    return res
      .status(400)
      .json({ status: false, message: "All fields required" });
  } 
  try {
    const updatedProduct = await sql`
            UPDATE products SET name=${name}, image=${image}, price=${price} WHERE products.id = ${id}
            RETURNING *
        `;
    if (updateProduct.length == 0) {
      return res.status(404).json({ success: false, msg: "product not found" });
    }
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.log("error while creating", error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await sql`
            DELETE FROM products WHERE products.id = ${id}
            RETURNING *

        `;

    if (deletedProduct.length == 0) {
      return res.status(404).json({ success: false, message: "product not found" });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("error while creating", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
