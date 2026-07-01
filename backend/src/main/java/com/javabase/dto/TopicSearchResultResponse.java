package com.javabase.dto;

import com.javabase.enums.Category;

public record TopicSearchResultResponse(
        String slug,
        String title,
        Category category,
        String snippet
) {
}
