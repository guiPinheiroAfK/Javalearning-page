package com.javabase.repository;

import com.javabase.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    Optional<UserProgress> findBySessionIdAndTopic_Slug(String sessionId, String topicSlug);

    // JOIN FETCH: traz o Topic junto num único SELECT — sem isso, cada item da lista
    // dispararia uma query extra pra carregar up.getTopic() (N+1 clássico).
    @Query("SELECT up FROM UserProgress up JOIN FETCH up.topic WHERE up.sessionId = :sessionId AND up.completed = true ORDER BY up.completedAt DESC")
    List<UserProgress> findCompletedWithTopicBySessionId(@Param("sessionId") String sessionId);

    @Query("SELECT AVG(up.quizScore) FROM UserProgress up WHERE up.sessionId = :sessionId AND up.quizScore IS NOT NULL")
    Double findAverageQuizScoreBySessionId(@Param("sessionId") String sessionId);

    @Query("SELECT up.completedAt FROM UserProgress up WHERE up.sessionId = :sessionId AND up.completed = true")
    List<LocalDateTime> findCompletedAtDatesBySessionId(@Param("sessionId") String sessionId);

    // Query nativa agregada: 1 query só, LEFT JOIN + GROUP BY, sem N+1 por categoria
    @Query(value = """
            SELECT t.category AS category,
                   COUNT(DISTINCT CASE WHEN up.completed = true THEN up.id END) AS completed,
                   COUNT(DISTINCT t.id) AS total
            FROM topic t
            LEFT JOIN user_progress up ON up.topic_id = t.id AND up.session_id = :sessionId
            GROUP BY t.category
            """, nativeQuery = true)
    List<CategoryStatsProjection> statsByCategory(@Param("sessionId") String sessionId);
}
