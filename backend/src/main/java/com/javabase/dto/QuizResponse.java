package com.javabase.dto;

import java.util.List;

// Não expõe correctIndex nem explanation — isso só vem na resposta de POST /progress/quiz,
// depois que o usuário já respondeu (evita "colar" pelo network tab).
public record QuizResponse(
        Long id,
        String question,
        List<String> options,
        int orderIndex
) {
}
