package com.dropbeam.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TextItem {
    private String id;
    private String content;
    private LocalDateTime sharedAt;
}
