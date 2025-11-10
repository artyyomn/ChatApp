
package com.example.realtimechat;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessageSendingOperations messagingTemplate;

    public ChatController(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage/{roomCode}")
    public void sendMessage(@DestinationVariable String roomCode, @Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/topic/public/" + roomCode, chatMessage);
    }

    @MessageMapping("/chat.addUser/{roomCode}")
    public void addUser(@DestinationVariable String roomCode, @Payload ChatMessage chatMessage,
                        SimpMessageHeaderAccessor headerAccessor) {
        // Add username and roomCode in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("roomCode", roomCode);
        messagingTemplate.convertAndSend("/topic/public/" + roomCode, chatMessage);
    }
}
