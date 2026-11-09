import { Link } from "react-router-dom";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" to="/">算法題解</Link>
        <nav className="site-nav">
          <Link to="/">全部題目</Link>
          <Link to="/compare">兩版比較</Link>
          <Link to="/terms">複雜度名詞解釋</Link>
        </nav>
      </div>
    </header>
  );
}
