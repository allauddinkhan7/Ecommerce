import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const { PGUSER, PGPASSWORD, PGHOST, PGDATABASE } = process.env;
//  psql 'postgresql://neondb_owner:npg_rfpzDW8k3IAv@ep-sparkling-hall-a80b58lk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
//create SQL connection
export const sql = neon(
    `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`
)
//this export sql func is used as a tagged template literal, which allow us to write sql queries safetly



async function connectDB()  {
      try {
        await sql `CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        )`;
        console.log("DB is successfully initialized")
      } catch (error) {
            console.log("DB not initialized", error);
            process.exit(1);
      }
}

export default connectDB