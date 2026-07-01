package com.javabase.enums;

// Categoria de um Topic. A ordem de DECLARAÇÃO aqui é o que define a ordem das
// categorias na trilha (DataSeeder ordena por ordinal() antes de inserir, e o
// frontend replica a mesma ordem em CATEGORY_ORDER). Topic.orderIndex só ordena
// os tópicos DENTRO de uma categoria, não as categorias entre si.
public enum Category {
    FUNDAMENTOS,
    OOP,
    ARMADILHAS,
    COLLECTIONS,
    EXCEPTIONS,
    JAVA_MODERNO,
    ECOSSISTEMA,
    SPRING_BOOT,
    HTTP_REST,
    SQL,
    // Trilha "enterprise" — adicionada depois da trilha original, por isso vem no final.
    CONCORRENCIA,
    MICROSERVICES,
    PERFORMANCE
}
