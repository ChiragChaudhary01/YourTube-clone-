import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";
import axiosInstance from "./axiosInstance";

const userContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    await signOut();
  };

  const handleGoogleSignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const payload = {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        image:
          firebaseUser.photoURL ||
          "https://avatars.githubusercontent.com/u/52344717?v=4",
      };
      const response = await axiosInstance.post("/user/login", payload);
      login(response.data.result);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const payload = {
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            image:
              firebaseUser.photoURL ||
              "https://avatars.githubusercontent.com/u/52344717?v=4",
          };
          const respose = await axiosInstance.post("/user/login", payload);
          login(respose.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    });
    return () => unSubscribe();
  }, []);
  return (
    <userContext.Provider value={{ user, login, logout, handleGoogleSignin }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
