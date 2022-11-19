import { AuthContext } from "@components/AuthContext";
import { useContext } from "react";

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("Cannot use auth context");
  }
  return ctx;
};
