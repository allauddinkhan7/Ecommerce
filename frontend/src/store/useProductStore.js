import { create } from "zustand";
import axios from "axios";

export const useProductStore = create((set, get) => ({
  products: [],
  error: null,
  loading: false,
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("http://localhost:4000/api/products/getProducts");
      set({ products: response.data.data, error: null });
    } catch (error) {
      console.log("error fetching products", error);
      if (err.status == 429)
        set({ error: "Rate limit exceeded", products: [] });
      else set({ error: "Something went wrong", products: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
