package com.dropbeam.controller;

import com.dropbeam.model.FileItem;
import com.dropbeam.model.Room;
import com.dropbeam.model.TextItem;
import com.dropbeam.service.RoomService;
import com.dropbeam.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class FileController {

    private final RoomService roomService;
    private final StorageService storageService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/files")
    public ResponseEntity<?> uploadFile(@PathVariable String roomId, @RequestParam("file") MultipartFile file) {
        Optional<Room> optionalRoom = roomService.getRoom(roomId);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = optionalRoom.get();
        String storageFilename = storageService.store(file);

        FileItem fileItem = new FileItem(
                UUID.randomUUID().toString(),
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                storageFilename,
                LocalDateTime.now()
        );

        room.getFiles().add(fileItem);

        // Notify room via websocket
        messagingTemplate.convertAndSend("/topic/room/" + roomId, "{\"type\": \"NEW_FILE\"}");

        return ResponseEntity.ok(fileItem);
    }

    @GetMapping("/files/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String roomId, @PathVariable String fileId, @RequestParam(defaultValue = "false") boolean inline) {
        Optional<Room> optionalRoom = roomService.getRoom(roomId);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = optionalRoom.get();
        Optional<FileItem> optionalFileItem = room.getFiles().stream()
                .filter(f -> f.getId().equals(fileId))
                .findFirst();

        if (optionalFileItem.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileItem fileItem = optionalFileItem.get();
        Resource file = storageService.loadAsResource(fileItem.getStorageFilename());

        String disposition = inline ? "inline" : "attachment";
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
                disposition + "; filename=\"" + fileItem.getOriginalFilename() + "\"").body(file);
    }

    @PostMapping("/texts")
    public ResponseEntity<?> shareText(@PathVariable String roomId, @RequestBody TextItem textRequest) {
        Optional<Room> optionalRoom = roomService.getRoom(roomId);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = optionalRoom.get();
        TextItem textItem = new TextItem(
                UUID.randomUUID().toString(),
                textRequest.getContent(),
                LocalDateTime.now()
        );

        room.getTexts().add(textItem);

        // Notify room via websocket
        messagingTemplate.convertAndSend("/topic/room/" + roomId, "{\"type\": \"NEW_TEXT\"}");

        return ResponseEntity.ok(textItem);
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String roomId, @PathVariable String fileId) {
        Optional<Room> optionalRoom = roomService.getRoom(roomId);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = optionalRoom.get();
        Optional<FileItem> optionalFileItem = room.getFiles().stream()
                .filter(f -> f.getId().equals(fileId))
                .findFirst();

        if (optionalFileItem.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileItem fileItem = optionalFileItem.get();
        room.getFiles().remove(fileItem);
        storageService.delete(fileItem.getStorageFilename());

        // Notify room via websocket
        messagingTemplate.convertAndSend("/topic/room/" + roomId, "{\"type\": \"FILE_DELETED\"}");

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/texts/{textId}")
    public ResponseEntity<?> deleteText(@PathVariable String roomId, @PathVariable String textId) {
        Optional<Room> optionalRoom = roomService.getRoom(roomId);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = optionalRoom.get();
        Optional<TextItem> optionalTextItem = room.getTexts().stream()
                .filter(t -> t.getId().equals(textId))
                .findFirst();

        if (optionalTextItem.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TextItem textItem = optionalTextItem.get();
        room.getTexts().remove(textItem);

        // Notify room via websocket
        messagingTemplate.convertAndSend("/topic/room/" + roomId, "{\"type\": \"TEXT_DELETED\"}");

        return ResponseEntity.ok().build();
    }
}
