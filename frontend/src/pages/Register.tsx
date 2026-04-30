import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

export function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Password123!");
  const [role, setRole] = useState<Role>("employee");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await register({ name, email, password, role });
      navigate("/");
    } catch {
      setError("Unable to create account. The email may already be registered.");
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <span className="eyebrow">WorkflowOps</span>
        <h1>Create account</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={(event) => setName(event.target.value)} required />
          <label className="form-label mt-3">Email</label>
          <input className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label className="form-label mt-3">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <label className="form-label mt-3">Role</label>
          <select className="form-select" value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn btn-primary w-100 mt-4">Create account</button>
        </form>
        <p className="auth-footnote">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
