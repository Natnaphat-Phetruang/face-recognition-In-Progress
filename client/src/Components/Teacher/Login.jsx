import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import "../Style/Loginpage.css";
import { Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    const storedPassword = localStorage.getItem("rememberedPassword");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const jsonData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        "http://localhost:3333/login",
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data;

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      if (responseData.status === "success") {
        Swal.fire("Login successful", "", "success");

        // เก็บ token ใน local
        localStorage.setItem("token", responseData.token);

        // Decode token ตรวจ role
        const decodedToken = jwtDecode(responseData.token);
        const userRole = decodedToken.role; // ดึง role
        console.log("Success", responseData);

        if (userRole === "nisit") {
          navigate("/DashboardLayou");
        } else if (userRole === "teacher") {
          navigate("/TDashboardLayou");
        }
      } else {
        Swal.fire("Login failed", responseData.message, "error");
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
            type="text"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input
            value={password}
            type={visible ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="Eye" onClick={() => setVisible(!visible)}>
            {visible ? (
              <EyeOutlined className="icon" />
            ) : (
              <EyeInvisibleOutlined className="icon" />
            )}
          </div>
        </div>
        <div className="below">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <Link to="/Forgotpassword">Forgot password?</Link>
        </div>
        <button type="submit" className="button">
          Login
        </button>
        <div className="register-link">
          Don't have an account?
          <Link to="/Register">Register</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
