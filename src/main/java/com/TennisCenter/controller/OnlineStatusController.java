package com.TennisCenter.controller;

import com.TennisCenter.config.WebSocketEventListener;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/player/chat")
public class OnlineStatusController {

    @GetMapping("/online-users")
    public Set<Long> getOnlineUsers() {
        return WebSocketEventListener.getOnlineUserIds();
    }
}