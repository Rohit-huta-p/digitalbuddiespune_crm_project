"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User } from "@/types/user";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  setUser: (user: any | null) => void;
  fetchUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await axios.post("/api/current-user");
      console.log(response.data);
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
  // Fetch user data on mount using the employeeId from the secure cookie
  useEffect(() => {
    fetchUser();
  }, []);

  const logout = async () => {
    try {
      const res = await axios.post(
        "/api/logout",
        {
          employeeId: user?.employeeId,
          latitude: "45.7128",
          longitude: "-90.0060",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res.data.success) {
        toast.success("Logout successful");
        setUser(null);
        router.push("/");
      } else {
        // Optional: handle cases where the API returns a 200 status but indicates failure
        toast.error("Invalid credentials");
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Access the error title and details from the API response
        const { error, details } = err.response.data;

        console.error(err.response.data);

        toast.error(`${error}: ${details}`);
      } else {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, fetchUser, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
