import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

const WS_URL = "ws://localhost:8000/api/admin/v2/pubsub";

export const useMotorcycleUpdates = (onUpdate: (data: any) => void) => {
  const { lastMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    reconnectInterval: 3000,
    onOpen: () => console.log("WebSocket открыт"),
    onError: (e) => console.error("WebSocket ошибка", e),
  });

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const msg = JSON.parse(lastMessage.data);
        if (msg.topic === "motorcycle_update") {
          onUpdate(msg.data);
        }
      } catch (e) {}
    }
  }, [lastMessage, onUpdate]);
}; 