"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAgentProfile, FirebaseAgent } from "./firestore-client";
import "./fetch-interceptor";

interface UserContextType {
  user: any | null;
  agent: FirebaseAgent | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshAgent: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [agent, setAgent] = useState<FirebaseAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for stored Firebase token on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log("[USER CONTEXT] useEffect running - checking localStorage");
        const token = localStorage.getItem("firebaseToken");
        const uid = localStorage.getItem("firebaseUid");
        const email = localStorage.getItem("firebaseEmail");

        console.log("[USER CONTEXT] Checking auth state. Token exists:", !!token, "UID:", uid, "Email:", email);

        if (token && uid) {
          const userData = {
            uid,
            email: email || "",
            token,
          };
          
          console.log("[USER CONTEXT] User authenticated, setting user state:", userData.email);
          setUser(userData);
          
          // Fetch agent profile
          if (email) {
            console.log("[USER CONTEXT] Calling fetchAgentProfile for UID:", uid);
            await fetchAgentProfile(uid, email);
          } else {
            console.log("[USER CONTEXT] No email, setting loading to false");
            setLoading(false);
          }
        } else {
          console.log("[USER CONTEXT] No auth token found, setting loading to false");
          setLoading(false);
        }
      } catch (err) {
        console.error("[USER CONTEXT] Error checking auth state:", err);
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const fetchAgentProfile = async (uid: string, email?: string) => {
    try {
      console.log("[USER CONTEXT] Fetching agent profile for UID:", uid);

      const response = await fetch(`/api/agent/profile?t=${Date.now()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${uid}`,
          "Cache-Control": "no-cache",
        },
      });

      console.log("[USER CONTEXT] Profile API response status:", response.status);
      const data = await response.json();
      console.log("[USER CONTEXT] Profile API response:", data);

      if (response.ok && data.agent) {
        setAgent(data.agent);
        setError(null);
      } else if (response.status === 404) {
        // Agent not found - create a default pending profile
        console.log("[USER CONTEXT] Agent not found, creating default profile");
        setAgent({
          id: uid,
          name: "Agent",
          email: email || "",
          phone: "",
          businessName: "My Business",
          description: "",
          logo: null,
          coverImage: null,
          status: "PENDING",
          slug: `agent-${uid.substring(0, 8)}`,
          totalEarned: 0,
          totalWithdrawn: 0,
          totalOrders: 0,
          balance: 0,
          commissionRate: 0.1,
        });
        setError(null);
      } else {
        console.error("[USER CONTEXT] Failed to load profile:", data.error);
        setError(data.error || "Failed to load profile");
        setAgent(null);
      }
    } catch (err) {
      console.error("[USER CONTEXT] Error fetching profile:", err);
      setError(`Failed to load profile: ${err instanceof Error ? err.message : String(err)}`);
      setAgent(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("firebaseToken");
      localStorage.removeItem("firebaseUid");
      localStorage.removeItem("firebaseEmail");
      
      // Clear cookies
      document.cookie = "firebaseToken=; path=/; max-age=0";
      document.cookie = "firebaseUid=; path=/; max-age=0";
      document.cookie = "firebaseEmail=; path=/; max-age=0";
      
      setUser(null);
      setAgent(null);
      setError(null);
    } catch (err) {
      console.error("Error signing out:", err);
      throw err;
    }
  };

  const refreshAgent = async () => {
    if (user?.uid) {
      await fetchAgentProfile(user.uid, user.email);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        agent,
        loading,
        error,
        signOut,
        refreshAgent,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
