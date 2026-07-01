package com.javabase.entity;

import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Lombok só é usado em Entities (getters/setters/construtores) — DTOs usam record.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "topic")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(nullable = false)
    private int orderIndex;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String codeExample;

    @Column(columnDefinition = "TEXT")
    private String codeExampleBad;

    // JSON array serializado como texto (ex: ["ponto 1", "ponto 2"])
    @Column(columnDefinition = "TEXT", nullable = false)
    private String keyPoints;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    // JSON array de slugs relacionados (ex: ["variaveis-tipos-primitivos"])
    @Column(columnDefinition = "TEXT")
    private String relatedTopicSlugs;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Quiz> quizzes = new ArrayList<>();

    @PrePersist
    protected void aoCriar() {
        LocalDateTime agora = LocalDateTime.now();
        this.createdAt = agora;
        this.updatedAt = agora;
    }

    @PreUpdate
    protected void aoAtualizar() {
        this.updatedAt = LocalDateTime.now();
    }
}
