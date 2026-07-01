package com.javabase.dto;

import jakarta.validation.constraints.NotBlank;

public record CompleteTopicRequest(
        @NotBlank(message = "sessionId é obrigatório") String sessionId,
        @NotBlank(message = "topicSlug é obrigatório") String topicSlug
) {
}
