package com.javabase.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Estratégia de cache: o conteúdo dos tópicos é praticamente estático (só muda quando
 * alguém edita o seeder/conteúdo), então vale a pena cachear localmente em memória
 * (Caffeine) em vez de bater no Postgres a cada request.
 *
 * - "topics-list": listagem completa do sidebar — muito lida, muda raramente. TTL de 10min
 *   pra garantir que uma atualização de conteúdo apareça em pouco tempo sem precisar reiniciar.
 * - "topic-detail": página de um tópico individual — TTL de 30min, porque o payload é maior
 *   (content + code + quizzes) e o ganho de evitar a query composta com @EntityGraph é maior.
 *
 * Cada cache tem seu próprio Caffeine builder porque o TTL é diferente entre eles —
 * um único CaffeineCacheManager aplicaria a mesma configuração pra todos os caches.
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCache topicsList = new CaffeineCache("topics-list",
                Caffeine.newBuilder()
                        .maximumSize(200)
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .build());

        CaffeineCache topicDetail = new CaffeineCache("topic-detail",
                Caffeine.newBuilder()
                        .maximumSize(200)
                        .expireAfterWrite(30, TimeUnit.MINUTES)
                        .build());

        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(topicsList, topicDetail));
        return manager;
    }
}
