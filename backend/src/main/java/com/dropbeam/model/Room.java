package com.dropbeam.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class Room {
    private String id;
    private LocalDateTime createdAt;
    private long expiresAtMillis;
    private List<FileItem> files = new ArrayList<>();
    private List<TextItem> texts = new ArrayList<>();

    public Room() {
        this.id = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        this.createdAt = LocalDateTime.now();
        this.expiresAtMillis = System.currentTimeMillis() + (15 * 60 * 1000); // 15 minutes
    }
}
