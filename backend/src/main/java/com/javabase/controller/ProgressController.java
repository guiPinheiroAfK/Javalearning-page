package com.javabase.controller;

import com.javabase.dto.CompleteTopicRequest;
import com.javabase.dto.ProgressOverviewResponse;
import com.javabase.dto.ProgressStatsResponse;
import com.javabase.dto.QuizResultResponse;
import com.javabase.dto.SubmitQuizRequest;
import com.javabase.dto.TopicProgressResponse;
import com.javabase.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/complete")
    public ResponseEntity<TopicProgressResponse> completar(@Valid @RequestBody CompleteTopicRequest request) {
        TopicProgressResponse response = progressService.marcarComoCompleto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizResultResponse> submeterQuiz(@Valid @RequestBody SubmitQuizRequest request) {
        QuizResultResponse response = progressService.submeterQuiz(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{sessionId}")
    public ProgressOverviewResponse buscarProgresso(@PathVariable String sessionId) {
        return progressService.buscarProgresso(sessionId);
    }

    @GetMapping("/{sessionId}/stats")
    public ProgressStatsResponse buscarStats(@PathVariable String sessionId) {
        return progressService.buscarStats(sessionId);
    }
}
