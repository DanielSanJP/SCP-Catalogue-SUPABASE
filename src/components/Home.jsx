import "../styles/Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      {/* Hero section - full width with centered content */}

      <div className="home">
        <img
          src="/SCP-LOGO.png"
          alt="SCP Logo"
          style={{ width: "300px", height: "auto", marginBottom: "20px" }}
        />
        <div className="content">
          <h1>Welcome to the SCP Foundation</h1>
          <p>Your one-stop destination for all things SCP.</p>
          <Link to="/scplist">
            <button>Get Started</button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Home;
