package com.TennisCenter.config;

import com.TennisCenter.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessagingTemplate messagingTemplate;

    // Track online users: userId -> set of session IDs
    private static final Map<Long, Set<String>> onlineUsers = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            User user = (User) auth.getPrincipal();
            String sessionId = accessor.getSessionId();

            onlineUsers.computeIfAbsent(user.getId(), k -> ConcurrentHashMap.newKeySet())
                    .add(sessionId);

            messagingTemplate.convertAndSend("/topic/online-status",
                    new OnlineStatusMessage(user.getId(), true));

            log.info("User connected: {} (session: {})", user.getDisplayUsername(), sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            User user = (User) auth.getPrincipal();
            String sessionId = accessor.getSessionId();

            Set<String> sessions = onlineUsers.get(user.getId());
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    onlineUsers.remove(user.getId());
                    messagingTemplate.convertAndSend("/topic/online-status",
                            new OnlineStatusMessage(user.getId(), false));
                }
            }

            log.info("User disconnected: {} (session: {})", user.getDisplayUsername(), sessionId);
        }
    }

    public static boolean isUserOnline(Long userId) {
        Set<String> sessions = onlineUsers.get(userId);
        return sessions != null && !sessions.isEmpty();
    }

    public static Set<Long> getOnlineUserIds() {
        return onlineUsers.keySet();
    }

    public record OnlineStatusMessage(Long userId, boolean online) {}
}