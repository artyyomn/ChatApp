
package com.example.realtimechat;

import java.util.ArrayList;
import java.util.List;

public class Room {

    private String roomCode;
    private List<String> users;

    public Room(String roomCode) {
        this.roomCode = roomCode;
        this.users = new ArrayList<>();
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public List<String> getUsers() {
        return users;
    }

    public void setUsers(List<String> users) {
        this.users = users;
    }

    public void addUser(String username) {
        this.users.add(username);
    }
}
