import React, { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import makeRequest from "../axios";

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await makeRequest.get("/user");
        setCurrentUser(res.data);
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (inputs) => {
    const res = await makeRequest.post("/auth/login", inputs);
    setCurrentUser(res.data.user);
  };

  const logout = () => {
    setCurrentUser(null);
    // Optionally call backend logout and clear cookie here
  };

  const AuthValues = {
    currentUser,
    login,
    logout,
    loading, // expose loading state
  };

  return (
    <AuthContext.Provider value={AuthValues}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
