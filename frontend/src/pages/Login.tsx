import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("employee@example.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate((location.state as { from?: { pathname: string } })?.from?.pathname ?? "/");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <span className="eyebrow">WorkflowOps</span>
        <h1>Sign in</h1>
        <p>Use one of the demo accounts to review employee, manager, or admin workflows.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label className="form-label mt-3">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="btn btn-primary w-100 mt-4" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="demo-list">
          <button type="button" onClick={() => setEmail("employee@example.com")}>Employee</button>
          <button type="button" onClick={() => setEmail("manager@example.com")}>Manager</button>
          <button type="button" onClick={() => setEmail("admin@example.com")}>Admin</button>
        </div>
        <p className="auth-footnote">
          New user? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
