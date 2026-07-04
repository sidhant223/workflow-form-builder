import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import FormBuilder from "./pages/formbuilder";
import Workflow from "./pages/workflow";
import Preview from "./pages/preview";
import Submissions from "./pages/submissions";
import Components from "./pages/components";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/form-builder" element={<FormBuilder />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/submissions" element={<Submissions />} />
            <Route path="/components" element={<Components />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;