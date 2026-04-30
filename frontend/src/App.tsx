import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CreateRequest } from "./pages/CreateRequest";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { ManagerQueue } from "./pages/ManagerQueue";
import { MyRequests } from "./pages/MyRequests";
import { NotAuthorized } from "./pages/NotAuthorized";
import { Register } from "./pages/Register";
import { RequestDetails } from "./pages/RequestDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/requests/new" element={<CreateRequest />} />
          <Route path="/requests/:id" element={<RequestDetails />} />
          <Route element={<ProtectedRoute roles={["manager", "admin"]} />}>
            <Route path="/manager" element={<ManagerQueue />} />
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route path="/not-authorized" element={<NotAuthorized />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
