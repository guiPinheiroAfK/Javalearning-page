package com.javabase.dto;

public record QuizQuestionResultResponse(
        Long questionId,
        boolean correct,
        int correctIndex,
        String explanation
) {
}
