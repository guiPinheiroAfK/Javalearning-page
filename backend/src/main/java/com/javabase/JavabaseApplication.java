package com.javabase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cache.annotation.EnableCaching;

// @EnableCaching: liga a infraestrutura de cache do Spring (necessário para @Cacheable/@CacheEvict funcionarem)
// UserDetailsServiceAutoConfiguration excluída: o projeto não tem login (ver SecurityConfig),
// então não faz sentido o Spring gerar um usuário/senha em memória a cada start.
@EnableCaching
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class JavabaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavabaseApplication.class, args);
    }

}
