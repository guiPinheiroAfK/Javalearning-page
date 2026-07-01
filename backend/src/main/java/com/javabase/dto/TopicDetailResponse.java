package com.javabase.dto;

import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;

import java.util.List;

public record TopicDetailResponse(
        String slug,
        String title,
        Category category,
        Difficulty difficulty,
        String content,
        String codeExample,
        String codeExampleBad,
        List<String> keyPoints,
        List<String> relatedTopicSlugs,
        List<QuizResponse> quizzes,
        boolean completed,
        Integer quizScore
) {
}
