// components/SocketTest.jsx
import React, { useEffect } from "react";
import { useNotification } from "../contexts/NotificationContext";

const SocketTest = () => {
  const { socket, socketConnected, sendTestNotification } = useNotification();

  useEffect(() => {
    console.log("Socket connection status:", socketConnected);
    console.log("Socket instance:", socket);
  }, [socketConnected, socket]);

  return (
    <div className="p-4 border rounded">
      <h3>Socket.IO Test</h3>
      <p>
        Status:
        <span
          className={`ml-2 ${
            socketConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          {socketConnected ? "✅ Connected" : "❌ Disconnected"}
        </span>
      </p>
      <p>Socket ID: {socket?.id || "Not connected"}</p>

      <button
        onClick={sendTestNotification}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        disabled={!socketConnected}
      >
        Send Test Notification
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>Backend URL: {import.meta.env.VITE_API_URL}</p>
        <p>Socket URL: {import.meta.env.VITE_SOCKET_URL}</p>
        <p>Environment: {import.meta.env.MODE}</p>
      </div>
    </div>
  );
};

export default SocketTest;
