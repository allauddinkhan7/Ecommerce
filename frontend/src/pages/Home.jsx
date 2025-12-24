import { useEffect } from "react";
import { useProductStore } from "../store/useProductStore";

const Home = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  console.log("first............................", products)
  return <div className="text-white">Home</div>;
};

export default Home;
