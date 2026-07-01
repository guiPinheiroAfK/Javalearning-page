package com.javabase.dto;

import java.util.List;

public record QuizResultResponse(
        int score,
        int total,
        int correct,
        List<QuizQuestionResultResponse> results
) {
}
