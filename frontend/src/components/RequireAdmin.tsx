import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../lib/auth";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
