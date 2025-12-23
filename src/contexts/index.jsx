import { AuthProvider } from "./AuthContext";

export const AppProviders = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
