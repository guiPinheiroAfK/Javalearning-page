package com.javabase.controller;

import com.javabase.config.SecurityConfig;
import com.javabase.dto.TopicSummaryResponse;
import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;
import com.javabase.exception.TopicNotFoundException;
import com.javabase.service.TopicService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// WEB LAYER TEST (@WebMvcTest): sobe apenas a camada HTTP (controller, filtros, exception
// handlers) — não sobe @Service de verdade nem banco. Usado para testar status codes,
// serialização JSON e o comportamento do @RestControllerAdvice.
@WebMvcTest(TopicController.class)
@Import(SecurityConfig.class) // sem isso, a auto-configuração padrão do Spring Security exigiria login
class TopicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TopicService topicService;

    @Test
    void listar_deveRetornar200ComListaAgrupada() throws Exception {
        TopicSummaryResponse resumo = new TopicSummaryResponse(
                "generics", "Generics (<T>)", Category.JAVA_MODERNO, 1, Difficulty.INTERMEDIARIO, false);
        Map<Category, List<TopicSummaryResponse>> agrupado = Map.of(Category.JAVA_MODERNO, List.of(resumo));

        when(topicService.listarAgrupados()).thenReturn(agrupado);

        mockMvc.perform(get("/api/v1/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.JAVA_MODERNO[0].slug").value("generics"));
    }

    @Test
    void buscarPorSlug_deveRetornar404_quandoSlugInvalido() throws Exception {
        when(topicService.buscarPorSlug(eq("slug-invalido"), any()))
                .thenThrow(new TopicNotFoundException("slug-invalido"));

        mockMvc.perform(get("/api/v1/topics/slug-invalido"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TOPIC_NOT_FOUND"))
                .andExpect(jsonPath("$.message").exists());
    }
}
