import { Router } from "oak";

const websocketRouter = new Router();
const connectedClients = new Set<WebSocket>();

// WebSocket endpoint
websocketRouter.get("/ws", async (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }
  
  const ws = ctx.upgrade();
  connectedClients.add(ws);
  
  console.log("WebSocket client connected");
  
  ws.onclose = () => {
    connectedClients.delete(ws);
    console.log("WebSocket client disconnected");
  };
  
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    connectedClients.delete(ws);
  };
  
  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket connection established'
  }));
});

// Broadcast function for sending updates to all connected clients
export function broadcastUpdate(data: any) {
  const message = JSON.stringify(data);
  
  for (const client of connectedClients) {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        connectedClients.delete(client);
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      connectedClients.delete(client);
    }
  }
}

export { websocketRouter };
