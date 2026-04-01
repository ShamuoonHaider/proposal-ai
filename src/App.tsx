import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import MemoryBuilder from "./pages/MemoryBuilder";
import Settings from "./pages/Settings";
import Proposals from "./pages/Proposals";
import ToastContainer from "./components/ToastContainer";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/memory" element={<MemoryBuilder />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
