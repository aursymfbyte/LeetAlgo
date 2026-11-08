import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../lib/auth";

export default function RequireAdmin({ children }: { children: ReactNode }) {
  if (getToken() === null) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
