package com.dropbeam.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileItem {
    private String id;
    private String originalFilename;
    private String contentType;
    private long size;
    private String storageFilename;
    private LocalDateTime uploadedAt;
}
