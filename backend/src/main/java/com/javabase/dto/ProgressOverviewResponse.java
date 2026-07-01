package com.javabase.dto;

import java.util.List;

public record ProgressOverviewResponse(
        int totalTopics,
        int completedTopics,
        Double averageQuizScore,
        List<CompletedTopicResponse> completed
) {
}
