import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Loginpage.css";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
    return emailPattern.test(email);
  };

  const [errors, setErrors] = useState({
    emailError: "",
    lengthError: "",
    uppercaseError: "",
    specialCharError: "",
  });

  const validatePassword = (password) => {
    const lengthValid = password.length >= 6;
    const uppercaseValid = /[A-Z]/.test(password);
    const specialCharValid = /[\W_]/.test(password);

    let lengthError = "";
    let uppercaseError = "";
    let specialCharError = "";

    if (!lengthValid) {
      alert("Password at least 6 characters.");
    } else if (!uppercaseValid) {
      alert("Password must at least one uppercase letter.");
    } else if (!specialCharValid) {
      alert("Password must at least one special letter.");
    }
    setErrors({
      lengthError,
      uppercaseError,
      specialCharError,
    });
    return lengthValid && uppercaseValid && specialCharValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const emailValid = validateEmail(email);
    if (!emailValid) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    setErrors({
      lengthError: "",
      uppercaseError: "",
      specialCharError: "",
    });

    const jsonData = {
      email: data.get("email"),
      password: data.get("password"),
      fname: data.get("fname"),
      lname: data.get("lname"),
    };
    fetch("http://localhost:3333/check_email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.emailExists) {
          setResult("This email address is already in use.");
        }
        return;
      });

    fetch("http://localhost:3333/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("register success");
          navigate("/login");
        } else {
          alert("Register failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="Container">
        <h1>Sign Up</h1>
        <div className="underline_Top"></div>
        <div className="inputname">
          <input type="text" name="fname" placeholder="First Name" required />
        </div>
        <div className="inputname">
          <input type="text" name="lname" placeholder="Last Name" required />
        </div>
        <div className="inputname">
          <input
            type="text"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.emailError && <p>{errors.emailError}</p>}
        </div>
        <div className="inputname">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="error">
            {errors.lengthError && <p>{errors.lengthError}</p>}
            {errors.uppercaseError && <p>{errors.uppercaseError}</p>}
            {errors.specialCharError && <p>{errors.specialCharError}</p>}
          </div>
        </div>
        <div className="butto">
          <button type="submit" className="button">
            Sign up
          </button>
        </div>
        {result && <div className="email-check-result">{result}</div>}
        <div className="regis-link">
          <p>
            Already have an account? <a href="Login">Login</a>
          </p>
        </div>
      </div>
    </form>
  );
}

export default Register;
