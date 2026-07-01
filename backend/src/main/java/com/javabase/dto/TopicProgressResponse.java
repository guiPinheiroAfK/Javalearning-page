package com.javabase.dto;

import java.time.LocalDateTime;

public record TopicProgressResponse(
        String topicSlug,
        boolean completed,
        LocalDateTime completedAt
) {
}
