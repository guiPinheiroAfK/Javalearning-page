package com.javabase.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quiz")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String question;

    // JSON array com as 4 alternativas (ex: ["true", "false", "Compilation error", "NullPointerException"])
    @Column(columnDefinition = "TEXT", nullable = false)
    private String options;

    @Column(nullable = false)
    private int correctIndex;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @Column(nullable = false)
    private int orderIndex;
}
