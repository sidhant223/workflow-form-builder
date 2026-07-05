// src/pages/login.jsx
// Route: /login (public)
// Mock authentication: matches email against MOCK_USERS and checks the
// shared demo password. On success, redirects back to wherever the user was
// headed before ProtectedRoute intercepted them (default: /dashboard).

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, MOCK_USERS, MOCK_PASSWORD } from "../store/authStore";
import Input from "../components/ui/input";
import Button from "../components/ui/button";

function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setError("");
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">FormFlow</h1>
          <p className="mt-1 text-gray-600">Sign in to manage forms and workflows.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@test.com"
            required
          />
          <Input
            label="Password"
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <Button type="submit" fullWidth>
            Login
          </Button>
        </form>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-600">Demo accounts (password: {MOCK_PASSWORD})</p>
          <ul className="mt-1 space-y-0.5">
            {MOCK_USERS.map((u) => (
              <li key={u.id}>
                {u.role}: {u.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
