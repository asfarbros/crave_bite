import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", backgroundColor: "#eee" }}>
      <Link to="/" style={{ margin: "0 10px" }}>Home</Link>
      <Link to="/menu" style={{ margin: "0 10px" }}>Menu</Link>
      <Link to="/cart" style={{ margin: "0 10px" }}>Cart</Link>
    </nav>
  );
}

export default Navbar;
