# Real-time Chat Application

This is a real-time chat application built with Spring Boot and WebSockets. It allows users to create chat rooms, join existing rooms, and exchange messages in real-time.

## Features

*   Create a new chat room with a unique room code.
*   Join an existing chat room using a room code.
*   Send and receive messages in real-time.
*   User presence notifications (join/leave).
*   Simple and intuitive user interface.

## Technologies Used

*   **Backend:**
    *   Java 21
    *   Spring Boot 3.2.2
    *   Spring WebSocket
    *   Maven
*   **Frontend:**
    *   HTML
    *   CSS (Bootstrap)
    *   JavaScript
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
    *   SockJS
    *   STOMP

## How to Run

1.  **Prerequisites:**
    *   Java 21 or higher
    *   Maven

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/realtime-chat.git
    ```

3.  **Navigate to the project directory:**
    ```bash
    cd realtime-chat
    ```

4.  **Build the application:**
    ```bash
    ./mvnw clean install
    ```

5.  **Run the application:**
    ```bash
    ./mvnw spring-boot:run
    ```

6.  **Access the application:**
    Open your web browser and go to `http://localhost:8080`.

## How it Works

### Backend

The backend is a Spring Boot application that uses the Spring WebSocket module to handle real-time communication.

*   **`WebSocketConfig`:** Configures the WebSocket message broker. It registers a STOMP endpoint at `/ws` and sets up a simple message broker with the destination prefix `/topic`. The application destination prefix is set to `/app`.
*   **`ChatController`:** Handles chat-related WebSocket messages.
    *   `@MessageMapping("/chat.sendMessage/{roomCode}")`: Receives a chat message and broadcasts it to all users in the specified room.
    *   `@MessageMapping("/chat.addUser")`: Adds a user to a chat room and notifies other users.
*   **`RoomController`:** A REST controller that handles creating and joining rooms.
    *   `@PostMapping("/api/rooms/create")`: Creates a new room with a random 6-character code.
    *   `@PostMapping("/api/rooms/join")`: Allows a user to join an existing room.
*   **`ChatMessage`:** A simple POJO representing a chat message.
*   **`Room`:** A simple POJO representing a chat room.

### Frontend

The frontend is a single-page application built with HTML, CSS, and JavaScript.

*   **`index.html`:** The main HTML file that contains the structure of the application.
*   **`main.css`:** Contains the custom styles for the application.
*   **`main.js`:** Handles the client-side logic.
    *   Uses SockJS and STOMP to communicate with the backend WebSocket server.
    *   Handles user interactions, such as sending and receiving messages, creating and joining rooms.

## API Endpoints

### REST API

*   **`POST /api/rooms/create`:** Creates a new chat room.
*   **`POST /api/rooms/join`:** Joins an existing chat room.
    *   **Request Body:**
        ```json
        {
          "roomCode": "your-room-code",
          "username": "your-username"
        }
        ```

### WebSocket Endpoints

*   **`/ws`:** The WebSocket endpoint for connecting to the server.
*   **`/app/chat.sendMessage/{roomCode}`:** The endpoint for sending a chat message.
*   **`/app/chat.addUser`:** The endpoint for adding a user to a chat room.
*   **`/topic/public/{roomCode}`:** The topic to subscribe to for receiving chat messages in a specific room.
