package com.javabase.service;

import com.javabase.dto.QuizResponse;
import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;

import java.util.List;

// Snapshot interno cacheável do conteúdo de um tópico — sem dado de sessão (completed/quizScore
// variam por usuário, então nunca entram aqui). Não é exposto pela API; TopicService o combina
// com o progresso do usuário para montar o TopicDetailResponse final.
record TopicSnapshot(
        String slug, String title, Category category, Difficulty difficulty,
        String content, String codeExample, String codeExampleBad,
        List<String> keyPoints, List<String> relatedTopicSlugs, List<QuizResponse> quizzes
) {
}
