try {
  // Check if email already exists
  const emailCheckResponse = await axios.post(
    "http://localhost:3333/check_email",
    { email }
  );

  const emailCheckData = emailCheckResponse.data;

  if (emailCheckData.emailExists) {
    setResult("This email ");
    return;
  }

  const jsonData = {
    email: data.get("email"),
    password: data.get("password"),
    fname: data.get("fname"),
    lname: data.get("lname"),
    faculty: data.get("faculty"),
    major: data.get("major"),
  };

  // Register the user
  const registerResponse = await axios.post(
    "http://localhost:3333/registernisit",
    jsonData
  );

  const registerData = registerResponse.data;

  if (registerData.status === "success") {
    toast.success("Register successfully", {
      autoClose: 900,
      position: "top-center",
    });
    setTimeout(() => {
      navigate("");
    }, 1500);
  } else {
    toast.error("This email address is already in use.", {
      autoClose: 1000,
      position: "top-center",
    });
  }
} catch (error) {
  console.error("Error:", error);
  toast.error("An error occurred during registration", {
    autoClose: 1000,
    position: "top-center",
  });
}
