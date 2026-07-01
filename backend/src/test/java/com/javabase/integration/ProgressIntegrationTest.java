package com.javabase.integration;

import com.javabase.dto.*;
import com.javabase.entity.Quiz;
import com.javabase.entity.Topic;
import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;
import com.javabase.repository.TopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

// INTEGRATION TEST (Testcontainers): sobe o contexto completo do Spring contra um
// PostgreSQL real num container Docker — não H2, não mock. Valida o fluxo de ponta a
// ponta (HTTP real via TestRestTemplate) e garante que as queries funcionam de verdade
// contra o mesmo banco usado em produção. É o teste mais lento e mais fiel ao ambiente real.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class ProgressIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void configurarDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TopicRepository topicRepository;

    private String slugDeTeste;

    @BeforeEach
    void setUp() {
        Topic topico = Topic.builder()
                .slug("topico-de-teste-" + UUID.randomUUID())
                .title("Tópico de Teste")
                .category(Category.FUNDAMENTOS)
                .orderIndex(1)
                .content("conteudo de teste")
                .codeExample("System.out.println(\"teste\");")
                .keyPoints("[\"ponto 1\"]")
                .difficulty(Difficulty.INICIANTE)
                .relatedTopicSlugs("[]")
                .build();

        Quiz quiz1 = Quiz.builder().topic(topico).question("1 + 1?")
                .options("[\"1\", \"2\", \"3\", \"4\"]").correctIndex(1)
                .explanation("1 + 1 = 2").orderIndex(1).build();
        Quiz quiz2 = Quiz.builder().topic(topico).question("2 + 2?")
                .options("[\"1\", \"2\", \"3\", \"4\"]").correctIndex(3)
                .explanation("2 + 2 = 4").orderIndex(2).build();
        topico.setQuizzes(List.of(quiz1, quiz2));

        topico = topicRepository.save(topico);
        slugDeTeste = topico.getSlug();
    }

    @Test
    void fluxoCompleto_completarTopicoEBuscarProgresso_deveRefletirNoOverview() {
        String sessionId = UUID.randomUUID().toString();

        ResponseEntity<TopicProgressResponse> completarResponse = restTemplate.postForEntity(
                "/api/v1/progress/complete",
                new CompleteTopicRequest(sessionId, slugDeTeste),
                TopicProgressResponse.class);

        assertThat(completarResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(completarResponse.getBody()).isNotNull();
        assertThat(completarResponse.getBody().completed()).isTrue();

        ResponseEntity<ProgressOverviewResponse> progressoResponse = restTemplate.getForEntity(
                "/api/v1/progress/" + sessionId, ProgressOverviewResponse.class);

        assertThat(progressoResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(progressoResponse.getBody()).isNotNull();
        assertThat(progressoResponse.getBody().completedTopics()).isEqualTo(1);
        assertThat(progressoResponse.getBody().completed())
                .anyMatch(c -> c.slug().equals(slugDeTeste));
    }

    @Test
    void submeterQuiz_deveCalcularScoreCorretamente() {
        String sessionId = UUID.randomUUID().toString();

        // Acerta a primeira (índice 1), erra a segunda (índice 0, correta é 3)
        ResponseEntity<QuizResultResponse> resultado = restTemplate.postForEntity(
                "/api/v1/progress/quiz",
                new SubmitQuizRequest(sessionId, slugDeTeste, List.of(1, 0)),
                QuizResultResponse.class);

        assertThat(resultado.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(resultado.getBody()).isNotNull();
        assertThat(resultado.getBody().total()).isEqualTo(2);
        assertThat(resultado.getBody().correct()).isEqualTo(1);
        assertThat(resultado.getBody().score()).isEqualTo(50);
    }
}
