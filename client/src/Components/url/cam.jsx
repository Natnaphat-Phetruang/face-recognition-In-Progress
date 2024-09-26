import React, { useEffect, useState } from "react";

const Cam = () => {
  const [image, setImage] = useState(null);
  const [student, setStudent] = useState({
    name: "",
    id: "",
    major: "",
    year: "",
    attendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ws;

    const connectWebSocket = () => {
      ws = new WebSocket("ws://127.0.0.1:8000/ws");

      ws.onopen = () => {
        console.log("WebSocket connection opened");
        setLoading(false);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.image) {
            setImage(`data:image/jpeg;base64,${data.image}`);
          }
          if (data.student) {
            setStudent(data.student);
          }
        } catch (e) {
          if (event.data.startsWith("/9j/")) {
            setImage(`data:image/jpeg;base64,${event.data}`);
          } else {
            console.error("Received non-JSON data:", event.data);
            setError("Received non-JSON data from WebSocket.");
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error: ", error);
        setError("WebSocket error: " + error.message);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setLoading(true);
        setTimeout(connectWebSocket, 1000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Camera Stream</h1>
      {image ? <img src={image} alt="Live Feed" /> : <p>No image available</p>}
      <div>
        <h2>Student Information</h2>
        <p>
          <strong>Name:</strong> {student.name || "N/A"}
        </p>
        <p>
          <strong>ID:</strong> {student.id || "N/A"}
        </p>
        <p>
          <strong>Major:</strong> {student.major || "N/A"}
        </p>
        <p>
          <strong>Year:</strong> {student.year || "N/A"}
        </p>
        <p>
          <strong>Attendance:</strong> {student.attendance || 0}
        </p>
      </div>
    </div>
  );
};

export default Cam;
