import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import "../Style/Loginpage.css";
import { Link } from "react-router-dom";

function NLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const jsonData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        "http://localhost:3333/login",
        jsonData
      );
      const responseData = response.data;

      console.log("Success", responseData);
      console.log("Response Data:", responseData);

      if (responseData.status === "success") {
        Swal.fire("Login successful", "", "success");
        localStorage.setItem("token", responseData.token);

        navigate("/DashboardLayout");
      } else {
        Swal.fire("Login failed", "error");
        navigate("/NisitLogin");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("An error occurred during login", "", "error");
    }
  };

  return (
    <div className="Box">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <div className="underline_top"></div>
        <div className="input-box">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <MdOutlineMailOutline className="icon" />
        </div>
        <div className="input-box">
          <input
            type=""
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FaUser className="icon" />
        </div>

        <button type="submit" className="button">
          Login
        </button>
        <div className="register-link">
          Don't have an account?
          <Link to="/Nisitregister">Register</Link>
        </div>
      </form>
    </div>
  );
}

export default NLogin;
