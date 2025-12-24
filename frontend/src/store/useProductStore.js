import { create } from "zustand";
import axios from "axios";
import toast from 'react-hot-toast';

const BASE_URL = "http://localhost:4000"
export const useProductStore = create((set, get) => ({
  products: [],
  error: null,
  loading: false,
  currentProduct: null,
   // form state
  formData: {
    name: "",
    price: "",
    image: "",
  },

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${BASE_URL}/api/products/getProducts`);
      set({ products: response.data.data, error: null });
    } catch (error) {
      console.log("error fetching products", error);
      if (error.status == 429)
        set({ error: "Rate limit exceeded", products: [] });
      else set({ error: "Something went wrong", products: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchProduct: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${BASE_URL}/api/products/getProduct/${id}`);
      set({
        currentProduct: response.data.data,
        formData: response.data.data, // pre-fill form with current product data
        error: null,
      });
    } catch (error) {
      console.log("Error in fetchProduct function", error);
      set({ error: "Something went wrong", currentProduct: null });
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(
        `${BASE_URL}/api/products/deleteProduct/${id}`
      );
      set((prev) => ({
        products: prev.products.filter((product) => product.id !== id),
      }));
      toast.success("Product deleted successfully");
    } catch (error) {
      set({ error: "error deleting product", error: error });
      toast.error(error.response.data.message);
    } finally {
      set({ loading: false });
    }
  },
}));
