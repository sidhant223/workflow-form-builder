import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/ui/spinner";

// Route-level code splitting: each page's bundle loads only when its route
// is visited, instead of all pages loading up front.
const Login = lazy(() => import("./pages/login"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Forms = lazy(() => import("./pages/forms"));
const FormBuilder = lazy(() => import("./pages/formbuilder"));
const Workflow = lazy(() => import("./pages/workflow"));
const Preview = lazy(() => import("./pages/preview"));
const Submissions = lazy(() => import("./pages/submissions"));
const PendingApprovals = lazy(() => import("./pages/pendingApprovals"));
const MySubmissions = lazy(() => import("./pages/mySubmissions"));
const UserManagement = lazy(() => import("./pages/userManagement"));
const Components = lazy(() => import("./pages/components"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner label="Loading…" className="min-h-screen" />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/forms" element={<Forms />} />
              <Route path="/form-builder" element={<FormBuilder />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/submissions" element={<Submissions />} />
              <Route path="/pending-approvals" element={<PendingApprovals />} />
              <Route path="/my-submissions" element={<MySubmissions />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/components" element={<Components />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
