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
  setFormData: (formData) => set({ formData }),

  


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
       const product = response.data.data;

    set({
      currentProduct: product,
      formData: {
        name: product.name || "",
        price: product.price || "",
        image: product.image || "",
      },
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

  updateProduct: async (id) => {
  set({ loading: true });
  try {
    const { formData } = get();
    const response = await axios.put(
      `${BASE_URL}/api/products/updateProduct/${id}`,
      formData
    );

    set({ currentProduct: response.data.data });
    toast.success("Product updated successfully");
  } catch (error) {
    toast.error("Something went wrong");
    console.log("Error in updateProduct function", error);
  } finally {
    set({ loading: false });
  }
},










}));
