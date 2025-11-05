
package com.example.realtimechat;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final Map<String, Room> rooms = new HashMap<>();

    @PostMapping("/create")
    public Room createRoom() {
        String roomCode = UUID.randomUUID().toString().substring(0, 6);
        Room room = new Room(roomCode);
        rooms.put(roomCode, room);
        return room;
    }

    @PostMapping("/join")
    public Room joinRoom(@RequestBody Map<String, String> payload) {
        String roomCode = payload.get("roomCode");
        String username = payload.get("username");
        Room room = rooms.get(roomCode);
        if (room != null) {
            room.addUser(username);
        }
        return room;
    }
}
