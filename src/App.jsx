import React from "react";
import SCPList from "./components/SCPList";
import "./styles/App.css";

function App() {
  return (
    <div className="App">
      <img
        src="/SCP-LOGO.png"
        alt="SCP Logo"
        style={{ width: "300px", height: "auto", marginBottom: "20px" }}
      />
      <SCPList />
    </div>
  );
}

export default App;
