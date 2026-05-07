import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type { ChatMessage } from "../types/chat";

type UseWebSocketOptions = {
    userId: number | null;
    onMessageReceived: (message: ChatMessage) => void;
    onReadReceipt?: (data: { conversationId: number; readByUserId: number }) => void;
    onOnlineStatus?: (data: { userId: number; online: boolean }) => void;
};

function useWebSocket({
                          userId,
                          onMessageReceived,
                          onReadReceipt,
                          onOnlineStatus,
                      }: UseWebSocketOptions) {
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                setConnected(true);

                // Subscribe to personal message queue
                client.subscribe(
                    `/user/${userId}/queue/messages`,
                    (frame) => {
                        const message: ChatMessage = JSON.parse(frame.body);
                        onMessageReceived(message);
                    }
                );

                // Subscribe to read receipts
                client.subscribe(
                    `/user/${userId}/queue/read-receipt`,
                    (frame) => {
                        const data = JSON.parse(frame.body);
                        onReadReceipt?.(data);
                    }
                );

                // Subscribe to online status broadcast
                client.subscribe("/topic/online-status", (frame) => {
                    const data = JSON.parse(frame.body);
                    onOnlineStatus?.(data);
                });
            },

            onDisconnect: () => {
                setConnected(false);
            },

            onStompError: (frame) => {
                console.error("STOMP error:", frame.headers["message"]);
                setConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
            setConnected(false);
        };
    }, [userId]);

    const sendMessage = useCallback(
        (recipientId: number, content: string) => {
            if (clientRef.current?.connected) {
                clientRef.current.publish({
                    destination: "/app/chat.send",
                    body: JSON.stringify({ recipientId, content }),
                });
            }
        },
        []
    );

    const sendReadReceipt = useCallback(
        (conversationId: number, otherUserId: number) => {
            if (clientRef.current?.connected) {
                clientRef.current.publish({
                    destination: "/app/chat.read",
                    body: JSON.stringify({ conversationId, otherUserId }),
                });
            }
        },
        []
    );

    return { connected, sendMessage, sendReadReceipt };
}

export default useWebSocket;