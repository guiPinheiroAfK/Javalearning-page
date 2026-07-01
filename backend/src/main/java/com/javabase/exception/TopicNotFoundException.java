package com.javabase.exception;

public class TopicNotFoundException extends RuntimeException {

    public TopicNotFoundException(String slug) {
        super("Tópico '%s' não encontrado".formatted(slug));
    }
}
