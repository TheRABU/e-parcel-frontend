import { AgentProvider } from "./AgentContext";
import { AuthProvider } from "./AuthContext";
import { NotificationProvider } from "./NotificationContext";
import { ParcelProvider } from "./ParcelContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ParcelProvider>
          <AgentProvider> {children}</AgentProvider>
        </ParcelProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};
