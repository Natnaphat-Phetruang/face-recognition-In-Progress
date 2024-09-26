import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Style/Loginpage.css";
import Swal from "sweetalert2";

function Profile() {
  const [user, setUser] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:3333/Authen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setUser(data.decoded);
        } else {
          Swal.fire("Error", "Failed to fetch user data.", "error");
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire(
          "Error",
          "An error occurred. Please try again later.",
          "error"
        );
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="Profile" style={{ color: "white" }}>
      <h1>Profile</h1>
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Name:</strong> {user.name || "N/A"}
          </p>
          {/* Add more user details as needed */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Profile;
