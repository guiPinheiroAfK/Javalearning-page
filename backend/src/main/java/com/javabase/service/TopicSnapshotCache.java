package com.javabase.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javabase.dto.QuizResponse;
import com.javabase.entity.Quiz;
import com.javabase.entity.Topic;
import com.javabase.exception.TopicNotFoundException;
import com.javabase.repository.TopicRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Bean dedicado só ao lookup cacheado do conteúdo de um tópico.
 *
 * Por que isso não é apenas um método de TopicService? @Cacheable funciona via proxy do
 * Spring AOP — a interceptação só acontece quando a chamada passa PELO PROXY (uma chamada
 * externa ao bean). Se TopicService.buscarPorSlug() chamasse this.buscarSnapshot(slug)
 * internamente (self-invocation), a chamada iria direto pro método real, pulando o proxy —
 * e o cache NUNCA seria acionado, mesmo com a anotação lá. Extrair pra um bean separado,
 * injetado via construtor, garante que a chamada sempre passe pelo proxy do TopicSnapshotCache.
 */
@Service
public class TopicSnapshotCache {

    private final TopicRepository topicRepository;
    private final ObjectMapper objectMapper;

    public TopicSnapshotCache(TopicRepository topicRepository, ObjectMapper objectMapper) {
        this.topicRepository = topicRepository;
        this.objectMapper = objectMapper;
    }

    @Cacheable(value = "topic-detail", key = "#slug")
    public TopicSnapshot buscar(String slug) {
        Topic topic = topicRepository.findWithQuizzesBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));

        List<QuizResponse> quizzes = topic.getQuizzes().stream()
                .sorted((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()))
                .map(this::paraQuizResponse)
                .toList();

        return new TopicSnapshot(
                topic.getSlug(), topic.getTitle(), topic.getCategory(), topic.getDifficulty(),
                topic.getContent(), topic.getCodeExample(), topic.getCodeExampleBad(),
                parseJsonArray(topic.getKeyPoints()), parseJsonArray(topic.getRelatedTopicSlugs()),
                quizzes
        );
    }

    private QuizResponse paraQuizResponse(Quiz quiz) {
        return new QuizResponse(quiz.getId(), quiz.getQuestion(), parseJsonArray(quiz.getOptions()), quiz.getOrderIndex());
    }

    private List<String> parseJsonArray(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("JSON inválido armazenado no banco: " + json, e);
        }
    }
}
