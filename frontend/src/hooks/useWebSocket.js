import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

export const useWebSocket = (roomId, onMessage) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const HOST = window.location.hostname;
    const WS_URL = import.meta.env.VITE_WS_URL || `http://${HOST}:8080/ws`;
    
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          if (message.body) {
            const data = JSON.parse(message.body);
            if (onMessage) onMessage(data);
            
            // Show toasts based on events
            if (data.type === 'USER_JOINED') {
              toast.success('A user connected to the room');
            } else if (data.type === 'ROOM_EXPIRED') {
              toast.error('This room has expired and is now closed');
            }
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [roomId, onMessage]);

  return { connected };
};
