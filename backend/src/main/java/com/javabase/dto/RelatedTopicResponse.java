package com.javabase.dto;

import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;

public record RelatedTopicResponse(
        String slug,
        String title,
        Category category,
        Difficulty difficulty
) {
}
