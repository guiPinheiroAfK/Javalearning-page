package com.javabase.dto;

import java.time.LocalDateTime;

public record CompletedTopicResponse(
        String slug,
        String title,
        LocalDateTime completedAt,
        Integer quizScore
) {
}
