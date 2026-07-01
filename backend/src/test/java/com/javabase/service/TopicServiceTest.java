package com.javabase.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.javabase.dto.TopicDetailResponse;
import com.javabase.dto.TopicSummaryResponse;
import com.javabase.entity.Topic;
import com.javabase.enums.Category;
import com.javabase.enums.Difficulty;
import com.javabase.exception.TopicNotFoundException;
import com.javabase.repository.TopicRepository;
import com.javabase.repository.UserProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

// UNIT TEST: testa a lógica de negócio em isolamento total, sem subir contexto Spring
// e sem bater em banco — TopicSnapshotCache e os repositories são mockados. Roda em milissegundos.
@ExtendWith(MockitoExtension.class)
class TopicServiceTest {

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private UserProgressRepository userProgressRepository;

    @Mock
    private TopicSnapshotCache topicSnapshotCache;

    private TopicService topicService;

    @BeforeEach
    void setUp() {
        // Injeção manual via construtor — nenhum contexto Spring necessário pra testar.
        topicService = new TopicService(topicRepository, userProgressRepository, topicSnapshotCache, new ObjectMapper());
    }

    @Test
    void buscarPorSlug_deveRetornarTopic_quandoSlugExiste() {
        TopicSnapshot snapshot = new TopicSnapshot(
                "generics", "Generics (<T>)", Category.JAVA_MODERNO, Difficulty.INTERMEDIARIO,
                "conteudo", "codigo", null, List.of("ponto 1"), List.of(), List.of()
        );
        when(topicSnapshotCache.buscar("generics")).thenReturn(snapshot);

        TopicDetailResponse response = topicService.buscarPorSlug("generics", null);

        assertThat(response.slug()).isEqualTo("generics");
        assertThat(response.title()).isEqualTo("Generics (<T>)");
        assertThat(response.completed()).isFalse();
        assertThat(response.quizScore()).isNull();
    }

    @Test
    void buscarPorSlug_deveLancar404_quandoSlugNaoExiste() {
        when(topicSnapshotCache.buscar("inexistente")).thenThrow(new TopicNotFoundException("inexistente"));

        assertThatThrownBy(() -> topicService.buscarPorSlug("inexistente", null))
                .isInstanceOf(TopicNotFoundException.class)
                .hasMessageContaining("inexistente");
    }

    @Test
    void listarAgrupados_deveAgruparPorCategoria() {
        Topic topicoFundamentos = Topic.builder()
                .slug("classes-objetos").title("Classes e Objetos").category(Category.FUNDAMENTOS)
                .orderIndex(5).difficulty(Difficulty.INICIANTE).build();
        Topic topicoOop = Topic.builder()
                .slug("heranca").title("Herança").category(Category.OOP)
                .orderIndex(2).difficulty(Difficulty.INTERMEDIARIO).build();

        when(topicRepository.findAllByOrderByCategoryAscOrderIndexAsc())
                .thenReturn(List.of(topicoFundamentos, topicoOop));

        Map<Category, List<TopicSummaryResponse>> resultado = topicService.listarAgrupados();

        assertThat(resultado).containsKeys(Category.FUNDAMENTOS, Category.OOP);
        assertThat(resultado.get(Category.FUNDAMENTOS)).hasSize(1);
        assertThat(resultado.get(Category.FUNDAMENTOS).get(0).slug()).isEqualTo("classes-objetos");
        // completed é sempre false nessa listagem — não depende de sessão (ver comentário em TopicService)
        assertThat(resultado.get(Category.OOP).get(0).completed()).isFalse();
    }
}
