package com.javabase.repository;

import com.javabase.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByTopicIdOrderByOrderIndexAsc(Long topicId);
}
