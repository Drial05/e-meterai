"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie, getCookie } from "cookies-next";
import { toast } from "sonner";

type User = {
  id: number;
  username: string;
  telepon: string;
  email: string;
  role?: string;
  avatar?: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");

    if (!token) {
      toast.error("Session expired, please login again", {
        duration: 5000,
        description: "Redirecting to login page...",
        icon: "❌",
        style: {
          background: "#fff",
          color: "#EF4444",
        },
      });
      router.push("/login");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          deleteCookie("token");
          toast.dismiss();
          toast.error("Session expired, please login again...", {
            duration: 5000,
            description: "Redirecting to login page...",
            icon: "❌",
            style: {
              background: "#fff",
              color: "#EF4444",
            },
          });
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (data.message === "Unauthorized") {
          deleteCookie("token");
          toast.dismiss();
          toast.error("Session expired, please login again...", {
            duration: 5000,
            description: "Redirecting to login page...",
            icon: "❌",
            style: {
              background: "#fff",
              color: "#EF4444",
            },
          });
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch (err) {
        // console.error("Error fetching user data:", err);
        toast.dismiss();
        toast.error("Failed to fetch user data", {
          duration: 5000,
          description: "Please try again later.",
          icon: "❌",
          style: {
            background: "#fff",
            color: "#EF4444",
          },
        });
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Loading user...</p>
        </div>
      ) : (
        children
      )}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
