package com.javabase.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubmitQuizRequest(
        @NotBlank(message = "sessionId é obrigatório") String sessionId,
        @NotBlank(message = "topicSlug é obrigatório") String topicSlug,
        @NotEmpty(message = "answers é obrigatório") List<Integer> answers
) {
}
