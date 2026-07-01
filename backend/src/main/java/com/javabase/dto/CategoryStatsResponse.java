package com.javabase.dto;

import com.javabase.enums.Category;

public record CategoryStatsResponse(
        Category category,
        long completed,
        long total
) {
}
