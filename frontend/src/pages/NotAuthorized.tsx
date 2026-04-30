import { Link } from "react-router-dom";

export function NotAuthorized() {
  return (
    <div className="state-block tall">
      <h2>Not authorized</h2>
      <p>Your current role does not have access to that workflow area.</p>
      <Link className="btn btn-primary" to="/">Return to dashboard</Link>
    </div>
  );
}
