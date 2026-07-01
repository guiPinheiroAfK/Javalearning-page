package com.javabase.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javabase.dto.RelatedTopicResponse;
import com.javabase.dto.TopicDetailResponse;
import com.javabase.dto.TopicSearchResultResponse;
import com.javabase.dto.TopicSummaryResponse;
import com.javabase.entity.Topic;
import com.javabase.entity.UserProgress;
import com.javabase.enums.Category;
import com.javabase.exception.TopicNotFoundException;
import com.javabase.repository.TopicRepository;
import com.javabase.repository.UserProgressRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final UserProgressRepository userProgressRepository;
    private final TopicSnapshotCache topicSnapshotCache;
    private final ObjectMapper objectMapper;

    // Constructor injection: torna a dependência explícita, imutável (final) e testável
    // sem precisar subir contexto Spring (dá pra instanciar com "new TopicService(mock, mock, mock, mock)").
    public TopicService(TopicRepository topicRepository, UserProgressRepository userProgressRepository,
                         TopicSnapshotCache topicSnapshotCache, ObjectMapper objectMapper) {
        this.topicRepository = topicRepository;
        this.userProgressRepository = userProgressRepository;
        this.topicSnapshotCache = topicSnapshotCache;
        this.objectMapper = objectMapper;
    }

    // @Cacheable: evita query no banco a cada page load. Como essa listagem nunca varia
    // por sessionId (completed sempre volta false aqui), a chave de cache é fixa — sem
    // esse detalhe, cachear uma resposta que muda por usuário devolveria dado errado pro próximo.
    @Cacheable("topics-list")
    public Map<Category, List<TopicSummaryResponse>> listarAgrupados() {
        return topicRepository.findAllByOrderByCategoryAscOrderIndexAsc().stream()
                .map(this::paraResumo)
                .collect(Collectors.groupingBy(TopicSummaryResponse::category, LinkedHashMap::new, Collectors.toList()));
    }

    public TopicDetailResponse buscarPorSlug(String slug, String sessionId) {
        // Chamada a um bean externo (não a "this") — é isso que garante que o @Cacheable
        // de TopicSnapshotCache.buscar() realmente passe pelo proxy do Spring. Ver o
        // comentário em TopicSnapshotCache sobre a armadilha de self-invocation.
        TopicSnapshot snapshot = topicSnapshotCache.buscar(slug);

        boolean completed = false;
        Integer quizScore = null;
        if (sessionId != null && !sessionId.isBlank()) {
            Optional<UserProgress> progresso = userProgressRepository.findBySessionIdAndTopic_Slug(sessionId, slug);
            if (progresso.isPresent()) {
                completed = progresso.get().isCompleted();
                quizScore = progresso.get().getQuizScore();
            }
        }

        return new TopicDetailResponse(
                snapshot.slug(), snapshot.title(), snapshot.category(), snapshot.difficulty(),
                snapshot.content(), snapshot.codeExample(), snapshot.codeExampleBad(),
                snapshot.keyPoints(), snapshot.relatedTopicSlugs(), snapshot.quizzes(),
                completed, quizScore
        );
    }

    public List<TopicSearchResultResponse> buscar(String q) {
        return topicRepository.search(q).stream()
                .map(t -> new TopicSearchResultResponse(t.getSlug(), t.getTitle(), t.getCategory(), gerarSnippet(t.getContent(), q)))
                .toList();
    }

    public List<RelatedTopicResponse> buscarRelacionados(String slug) {
        Topic topic = topicRepository.findBySlug(slug)
                .orElseThrow(() -> new TopicNotFoundException(slug));

        List<String> slugsRelacionados = parseJsonArray(topic.getRelatedTopicSlugs());
        if (slugsRelacionados.isEmpty()) {
            return List.of();
        }

        return topicRepository.findBySlugIn(slugsRelacionados).stream()
                .map(t -> new RelatedTopicResponse(t.getSlug(), t.getTitle(), t.getCategory(), t.getDifficulty()))
                .toList();
    }

    private TopicSummaryResponse paraResumo(Topic topic) {
        return new TopicSummaryResponse(topic.getSlug(), topic.getTitle(), topic.getCategory(),
                topic.getOrderIndex(), topic.getDifficulty(), false);
    }

    private String gerarSnippet(String content, String q) {
        String lower = content.toLowerCase();
        int idx = lower.indexOf(q.toLowerCase());
        if (idx < 0) {
            return content.length() > 140 ? content.substring(0, 140).trim() + "..." : content;
        }
        int inicio = Math.max(0, idx - 40);
        int fim = Math.min(content.length(), idx + q.length() + 80);
        String trecho = content.substring(inicio, fim).replaceAll("\\s+", " ").trim();
        return (inicio > 0 ? "..." : "") + trecho + (fim < content.length() ? "..." : "");
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
