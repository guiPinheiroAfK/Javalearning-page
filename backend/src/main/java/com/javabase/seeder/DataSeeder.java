package com.javabase.seeder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javabase.entity.Quiz;
import com.javabase.entity.Topic;
import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;
import com.javabase.repository.TopicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

/**
 * Popula o banco com o conteúdo didático do JavaBase, lendo os arquivos
 * classpath:seed/topics-*.json (um por categoria — ver src/main/resources/seed/).
 *
 * Só roda se a tabela topic estiver vazia: evita duplicar conteúdo a cada restart
 * da aplicação em dev (com ddl-auto=update, o schema persiste entre execuções).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final TopicRepository topicRepository;
    private final ObjectMapper objectMapper;

    public DataSeeder(TopicRepository topicRepository, ObjectMapper objectMapper) {
        this.topicRepository = topicRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (topicRepository.count() > 0) {
            logger.info("DataSeeder: tabela topic já populada, pulando seed.");
            return;
        }

        List<SeedTopic> seedTopics = carregarSeedTopics();
        for (SeedTopic seedTopic : seedTopics) {
            topicRepository.save(paraEntidade(seedTopic));
        }

        logger.info("DataSeeder: {} tópicos carregados com sucesso.", seedTopics.size());
    }

    private List<SeedTopic> carregarSeedTopics() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:seed/topics-*.json");

        List<SeedTopic> todos = new ArrayList<>();
        for (Resource resource : resources) {
            try (InputStream in = resource.getInputStream()) {
                SeedTopic[] topicos = objectMapper.readValue(in, SeedTopic[].class);
                todos.addAll(Arrays.asList(topicos));
            }
        }

        // Ordena pela ordem natural das categorias (a mesma ordem declarada em Category)
        // e depois por orderIndex dentro da categoria — garante uma ordem de inserção previsível.
        todos.sort(Comparator
                .comparing((SeedTopic st) -> Category.valueOf(st.category()))
                .thenComparingInt(SeedTopic::orderIndex));

        return todos;
    }

    private Topic paraEntidade(SeedTopic seed) {
        Topic topic = Topic.builder()
                .slug(seed.slug())
                .title(seed.title())
                .category(Category.valueOf(seed.category()))
                .orderIndex(seed.orderIndex())
                .content(seed.content())
                .codeExample(seed.codeExample())
                .codeExampleBad(seed.codeExampleBad())
                .keyPoints(paraJson(seed.keyPoints()))
                .difficulty(Difficulty.valueOf(seed.difficulty()))
                .relatedTopicSlugs(paraJson(seed.relatedTopicSlugs()))
                .build();

        List<Quiz> quizzes = new ArrayList<>();
        int ordem = 1;
        for (SeedQuiz seedQuiz : seed.quizzes()) {
            quizzes.add(Quiz.builder()
                    .topic(topic) // relação bidirecional — necessária pro cascade funcionar
                    .question(seedQuiz.question())
                    .options(paraJson(seedQuiz.options()))
                    .correctIndex(seedQuiz.correctIndex())
                    .explanation(seedQuiz.explanation())
                    .orderIndex(ordem++)
                    .build());
        }
        topic.setQuizzes(quizzes); // cascade = ALL no Topic salva os Quizzes junto

        return topic;
    }

    private String paraJson(List<String> lista) {
        try {
            return objectMapper.writeValueAsString(lista == null ? List.of() : lista);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao serializar lista pra JSON", e);
        }
    }

    // Records auxiliares só pra desserializar o JSON de seed — não são Entity nem DTO da API.
    private record SeedTopic(
            String slug, String title, String category, int orderIndex, String difficulty,
            String content, String codeExample, String codeExampleBad,
            List<String> keyPoints, List<String> relatedTopicSlugs, List<SeedQuiz> quizzes
    ) {
    }

    private record SeedQuiz(String question, List<String> options, int correctIndex, String explanation) {
    }
}
