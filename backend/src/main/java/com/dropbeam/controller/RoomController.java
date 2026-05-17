package com.dropbeam.controller;

import com.dropbeam.model.Room;
import com.dropbeam.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<Room> createRoom() {
        Room room = roomService.createRoom();
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoom(@PathVariable String id) {
        Optional<Room> room = roomService.getRoom(id);
        return room.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinRoom(@PathVariable String id) {
        Optional<Room> room = roomService.getRoom(id);
        if (room.isPresent()) {
            messagingTemplate.convertAndSend("/topic/room/" + id, "{\"type\": \"USER_JOINED\"}");
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
