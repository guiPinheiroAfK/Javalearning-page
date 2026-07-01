package com.javabase.controller;

import com.javabase.dto.RelatedTopicResponse;
import com.javabase.dto.TopicDetailResponse;
import com.javabase.dto.TopicSearchResultResponse;
import com.javabase.dto.TopicSummaryResponse;
import com.javabase.enums.Category;
import com.javabase.service.TopicService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public Map<Category, List<TopicSummaryResponse>> listar() {
        return topicService.listarAgrupados();
    }

    @GetMapping("/search")
    public List<TopicSearchResultResponse> buscar(@RequestParam("q") String q) {
        return topicService.buscar(q);
    }

    @GetMapping("/{slug}")
    public TopicDetailResponse buscarPorSlug(@PathVariable String slug,
                                              @RequestParam(required = false) String sessionId) {
        return topicService.buscarPorSlug(slug, sessionId);
    }

    @GetMapping("/{slug}/related")
    public List<RelatedTopicResponse> buscarRelacionados(@PathVariable String slug) {
        return topicService.buscarRelacionados(slug);
    }
}
