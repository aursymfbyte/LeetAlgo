import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";
import { saveToken } from "../lib/auth";
import { useDocumentTitle } from "../lib/useDocumentTitle";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle("管理者登入");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const token = await login(userName, password);
      saveToken(token);
      navigate("/admin");
    } catch (loginError) {
      setError((loginError as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-narrow">
      <h1>管理者登入</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          帳號
          <input
            value={userName}
            autoComplete="username"
            required
            onChange={(event) => setUserName(event.target.value)}
          />
        </label>
        <label>
          密碼
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error !== "" && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={submitting}>登入</button>
        </div>
      </form>
    </section>
  );
}
