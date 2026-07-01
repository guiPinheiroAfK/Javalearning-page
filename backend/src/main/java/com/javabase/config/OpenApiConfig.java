package com.javabase.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI javabaseOpenApi() {
        return new OpenAPI().info(new Info()
                .title("JavaBase API")
                .description("Fundamentos Java & Software Engineering — a API que serve o conteúdo é o próprio exemplo do que ele ensina")
                .version("v1"));
    }
}
