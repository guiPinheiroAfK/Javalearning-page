package com.javabase.repository;

// Projeção usada pela query nativa agregada de UserProgressRepository#statsByCategory
public interface CategoryStatsProjection {
    String getCategory();
    Long getCompleted();
    Long getTotal();
}
