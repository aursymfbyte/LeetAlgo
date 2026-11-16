import { Link, useLocation } from "react-router-dom";
import { getToken, getUserName, isLoggedIn } from "../lib/auth";

export default function SiteHeader() {
  useLocation();
  const hasToken = getToken() !== null;
  const loggedIn = isLoggedIn();

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" to="/">算法題解</Link>
        <nav className="site-nav">
          <Link to="/">全部題目</Link>
          <Link to="/compare">兩版比較</Link>
          <Link to="/terms">複雜度名詞解釋</Link>
          {loggedIn && <Link className="login-state" to="/admin">已登入：{getUserName()}</Link>}
          {hasToken && !loggedIn && <Link className="login-state" to="/admin/login">登入已過期，重新登入</Link>}
        </nav>
      </div>
    </header>
  );
}
