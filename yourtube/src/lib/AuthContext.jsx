import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./firebase";
import axiosInstance from "./axiosInstance";

const userContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [remainingWatchSeconds, setRemainingWatchSeconds] = useState(null);
  const [watchedTodaySeconds, setWatchedTodaySeconds] = useState(0);

  // Load today's watched seconds from localStorage
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const stored = localStorage.getItem(`watched_${todayKey}`);
    setWatchedTodaySeconds(stored ? parseInt(stored, 10) || 0 : 0);
  }, []);

  // Helper to add seconds to today's tally and persist
  const addWatchedSeconds = (sec) => {
    if (!sec || sec <= 0) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    setWatchedTodaySeconds((prev) => {
      const next = prev + sec;
      localStorage.setItem(`watched_${todayKey}`, String(next));
      return next;
    });
  };
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
    <userContext.Provider value={{ user, login, logout, handleGoogleSignin, remainingWatchSeconds, setRemainingWatchSeconds, watchedTodaySeconds, addWatchedSeconds }}>
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => useContext(userContext);
