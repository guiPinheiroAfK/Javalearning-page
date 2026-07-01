package com.javabase.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * O projeto não tem login/autenticação — o Spring Security aqui existe só pra:
 * 1) ligar o CorsConfigurationSource definido em CorsConfig;
 * 2) manter os security headers padrão do Spring (X-Content-Type-Options, X-Frame-Options...);
 * 3) desligar CSRF, que não faz sentido numa API stateless sem sessão de usuário autenticado.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {}) // usa o bean CorsConfigurationSource do CorsConfig
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}
