import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import Workflow from "./pages/Workflow";
import Preview from "./pages/Preview";
import Submissions from "./pages/Submissions";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/form-builder" element={<FormBuilder />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/submissions" element={<Submissions />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;