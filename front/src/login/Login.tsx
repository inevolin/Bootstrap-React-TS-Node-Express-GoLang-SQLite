/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Toaster, Position } from "@blueprintjs/core";
import { API_ENDPOINT } from "../Shared";

const AppToaster = Toaster.create({
  position: Position.TOP,
});

function Login() {
  const navigate = useNavigate();

  // auth
  const [isLoggedIn, setLoggedIn] = useState(Boolean);
  useEffect(() => {
    fetch(`${API_ENDPOINT}/api/auth`, {
      headers: { Authorization: localStorage.getItem("jwt") as string },
    })
      .then((response) => response.json())
      .then((resp) => {
        setLoggedIn(resp);
        if (resp === true) navigate("/user"); // redirect, already logged in
      })
      .catch(() => null);
  }, []);

  const initialValues = {
    email: "",
    password: "",
  };
  const [formValues, setFormValues] = useState(initialValues);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    fetch(`${API_ENDPOINT}/api/login`, {
      method: "POST",
      body: JSON.stringify({
        email: formValues.email,
        password: formValues.password,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then(async (response) => {
        if (response.ok) return await response.json();
        else throw await response.json();
      })
      .then((data) => {
        localStorage.setItem("jwt", data.jwt); // TODO: perhaps use cookie instead of localStorage for security reasons
        AppToaster.show({
          message: "Login success",
          intent: "success",
          timeout: 3000,
        });
        navigate("/user"); // redirect
      })
      .catch((response) => {
        AppToaster.show({
          message: response.err,
          intent: "danger",
          timeout: 3000,
        });
      });
  };

  return (
    <>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          <div className="ui divider"></div>
          <div className="ui form">
            <div className="field">
              <label>Email</label>
              <input
                type="text"
                name="email"
                placeholder="Email"
                value={formValues.email}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formValues.password}
                onChange={handleChange}
              />
            </div>
            <button className="fluid ui button blue">Submit</button>
          </div>
        </form>
      </div>{" "}
    </>
  );
}

export default Login;
