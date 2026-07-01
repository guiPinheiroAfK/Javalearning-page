package com.javabase.dto;

import java.util.List;

public record ProgressStatsResponse(
        List<CategoryStatsResponse> byCategory,
        int totalCompleted,
        int totalTopics,
        double percentComplete,
        int streakDias
) {
}
