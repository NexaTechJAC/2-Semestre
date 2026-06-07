import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import TrocarSenhaPrimeiroAcesso from "./pages/TrocarSenhaPrimeiroAcesso";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trocar-senha" element={<TrocarSenhaPrimeiroAcesso />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute perfisPermitidos={["administrador", "secretaria"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;