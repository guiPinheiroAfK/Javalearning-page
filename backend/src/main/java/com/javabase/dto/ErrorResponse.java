package com.javabase.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        String code,
        String message,
        LocalDateTime timestamp,
        Map<String, String> fields
) {
    public ErrorResponse(String code, String message, LocalDateTime timestamp) {
        this(code, message, timestamp, null);
    }
}
