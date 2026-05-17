package com.dropbeam.service;

import com.dropbeam.model.FileItem;
import com.dropbeam.model.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupScheduler {

    private final RoomService roomService;
    private final StorageService storageService;
    private final SimpMessagingTemplate messagingTemplate;

    // Run every minute
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredRooms() {
        LocalDateTime now = LocalDateTime.now();
        List<Room> rooms = roomService.getAllRooms().stream().toList();

        for (Room room : rooms) {
            // Rooms expire when their expiration time is reached
            if (room.getExpiresAtMillis() < System.currentTimeMillis()) {
                log.info("Deleting expired room: {}", room.getId());
                
                // Delete physical files
                for (FileItem file : room.getFiles()) {
                    storageService.delete(file.getStorageFilename());
                }
                
                // Notify clients that room has expired
                messagingTemplate.convertAndSend("/topic/room/" + room.getId(), "{\"type\": \"ROOM_EXPIRED\"}");
                
                roomService.deleteRoom(room.getId());
            }
        }
    }
}
