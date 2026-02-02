"use client";

import { useState, useEffect } from "react";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImg: string;
  birthdate: string;
  clerkId: string;
  pet: {
    id: string;
    name: string;
    breed: string;
    gender: string;
    age: number;
    petImg: string;
    healthInfo: string;
  };
};

export const useAuth = (clerkId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (clerkId) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/auth/${clerkId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user");
          }
          const data = await response.json();
          setUser(data);
        } catch (error) {
          setError(error as Error);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, [clerkId]);

  return { user, loading, error };
};
