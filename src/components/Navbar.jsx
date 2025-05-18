import "../styles/Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="top">
          <Link to="/">
            <img
              src="/SCP-LOGO.png"
              alt="SCP Logo"
              style={{ width: "300px", height: "auto", marginBottom: "20px" }}
            />
          </Link>
        </div>
      </div>
      <div className="navbar-links-container">
        <ul className="navbarlinks">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/scplist">SCP Database</Link>
          </li>
          <li>
            <Link to="/createscp">Create SCP</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
