package com.javabase.dto;

import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;

// Usado na listagem do sidebar — sem content/codeExample (payload leve)
public record TopicSummaryResponse(
        String slug,
        String title,
        Category category,
        int orderIndex,
        Difficulty difficulty,
        boolean completed
) {
}
