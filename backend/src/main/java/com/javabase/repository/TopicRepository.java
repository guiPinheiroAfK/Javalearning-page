package com.javabase.repository;

import com.javabase.entity.Topic;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

    List<Topic> findAllByOrderByCategoryAscOrderIndexAsc();

    Optional<Topic> findBySlug(String slug);

    // @EntityGraph: traz topic + quizzes numa única query (evita N+1 ao renderizar a TopicPage)
    @EntityGraph(attributePaths = "quizzes")
    Optional<Topic> findWithQuizzesBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Topic> findBySlugIn(List<String> slugs);

    // ILIKE é específico do Postgres: comparação case-insensitive sem precisar de LOWER() dos dois lados
    @Query(value = """
            SELECT * FROM topic t
            WHERE t.title ILIKE CONCAT('%', :q, '%') OR t.content ILIKE CONCAT('%', :q, '%')
            ORDER BY t.category, t.order_index
            """, nativeQuery = true)
    List<Topic> search(@Param("q") String q);
}
