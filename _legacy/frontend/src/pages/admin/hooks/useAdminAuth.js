import { useState, useEffect } from "react";
import { useCMS } from "@/context/CMSContext";

export function useAdminAuth() {
  const { verifyAdmin, isAdmin, logout, token } = useCMS();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("cvpm_admin_token");
    if (storedToken) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (password) => {
    return await verifyAdmin(password);
  };

  const handleLogout = () => {
    logout();
  };

  return { isAdmin, isLoading, token, handleLogin, handleLogout };
}