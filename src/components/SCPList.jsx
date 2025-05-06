import React, { useEffect, useState } from "react";
import { getAllSubjects } from "../services/api";

const SCPList = () => {
  const [scpSubjects, setScpSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubjects();
        setScpSubjects(data);
      } catch (error) {
        console.error("Error fetching SCP subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>SCP Subjects</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {scpSubjects.map((scp) => (
          <div
            key={scp.item}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#d2d2d2",
              color: "#000",
            }}
          >
            <h3>
              {scp.item} - {scp.class}
            </h3>
            <p>
              <strong>Description:</strong> {scp.description}
            </p>
            <p>
              <strong>Containment:</strong> {scp.containment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SCPList;
