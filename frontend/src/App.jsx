import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import { useThemeStore } from "./store/useThemeStore";
import { Toaster } from "react-hot-toast";

function App() {
  const theme = useThemeStore;
  return (
    <>
      <div
        className="min-h-screen bg-base-200 transition-colors duration-300"
        // data-theme={theme}
      >
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productPage/:id" element={<ProductPage />} />
        </Routes>

        <Toaster position="top-right" />
      </div>
    </>
  );
}

export default App;
