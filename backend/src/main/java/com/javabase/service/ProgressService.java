package com.javabase.service;

import com.javabase.dto.*;
import com.javabase.entity.Quiz;
import com.javabase.entity.Topic;
import com.javabase.entity.UserProgress;
import com.javabase.enums.Category;
import com.javabase.exception.TopicNotFoundException;
import com.javabase.repository.CategoryStatsProjection;
import com.javabase.repository.QuizRepository;
import com.javabase.repository.TopicRepository;
import com.javabase.repository.UserProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Service
public class ProgressService {

    private final UserProgressRepository userProgressRepository;
    private final TopicRepository topicRepository;
    private final QuizRepository quizRepository;

    public ProgressService(UserProgressRepository userProgressRepository, TopicRepository topicRepository, QuizRepository quizRepository) {
        this.userProgressRepository = userProgressRepository;
        this.topicRepository = topicRepository;
        this.quizRepository = quizRepository;
    }

    // @Transactional: upsert (buscar + salvar) precisa ser atômico — sem isso, duas
    // requisições concorrentes do mesmo usuário poderiam criar duas linhas e violar
    // a UNIQUE CONSTRAINT (sessionId, topic_id) com uma exception feia em vez de um update limpo.
    @Transactional
    public TopicProgressResponse marcarComoCompleto(CompleteTopicRequest request) {
        Topic topic = topicRepository.findBySlug(request.topicSlug())
                .orElseThrow(() -> new TopicNotFoundException(request.topicSlug()));

        UserProgress progresso = userProgressRepository.findBySessionIdAndTopic_Slug(request.sessionId(), request.topicSlug())
                .orElseGet(() -> UserProgress.builder()
                        .sessionId(request.sessionId())
                        .topic(topic)
                        .completed(false)
                        .build());

        progresso.setCompleted(true);
        progresso.setCompletedAt(LocalDateTime.now());
        userProgressRepository.save(progresso);

        return new TopicProgressResponse(topic.getSlug(), true, progresso.getCompletedAt());
    }

    @Transactional
    public QuizResultResponse submeterQuiz(SubmitQuizRequest request) {
        Topic topic = topicRepository.findBySlug(request.topicSlug())
                .orElseThrow(() -> new TopicNotFoundException(request.topicSlug()));

        List<Quiz> quizzes = quizRepository.findByTopicIdOrderByOrderIndexAsc(topic.getId());
        List<Integer> respostas = request.answers();

        List<QuizQuestionResultResponse> resultados = new ArrayList<>();
        int acertos = 0;
        for (int i = 0; i < quizzes.size(); i++) {
            Quiz quiz = quizzes.get(i);
            Integer resposta = i < respostas.size() ? respostas.get(i) : null;
            boolean correta = resposta != null && resposta == quiz.getCorrectIndex();
            if (correta) {
                acertos++;
            }
            resultados.add(new QuizQuestionResultResponse(quiz.getId(), correta, quiz.getCorrectIndex(), quiz.getExplanation()));
        }

        int total = quizzes.size();
        int score = total == 0 ? 0 : (int) Math.round((acertos * 100.0) / total);

        UserProgress progresso = userProgressRepository.findBySessionIdAndTopic_Slug(request.sessionId(), request.topicSlug())
                .orElseGet(() -> UserProgress.builder()
                        .sessionId(request.sessionId())
                        .topic(topic)
                        .completed(false)
                        .build());
        progresso.setQuizScore(score);
        userProgressRepository.save(progresso);

        return new QuizResultResponse(score, total, acertos, resultados);
    }

    public ProgressOverviewResponse buscarProgresso(String sessionId) {
        List<UserProgress> completos = userProgressRepository.findCompletedWithTopicBySessionId(sessionId);
        long totalTopicos = topicRepository.count();
        Double media = userProgressRepository.findAverageQuizScoreBySessionId(sessionId);

        List<CompletedTopicResponse> completados = completos.stream()
                .map(up -> new CompletedTopicResponse(up.getTopic().getSlug(), up.getTopic().getTitle(), up.getCompletedAt(), up.getQuizScore()))
                .toList();

        return new ProgressOverviewResponse((int) totalTopicos, completados.size(), media, completados);
    }

    public ProgressStatsResponse buscarStats(String sessionId) {
        List<CategoryStatsProjection> projecoes = userProgressRepository.statsByCategory(sessionId);

        List<CategoryStatsResponse> porCategoria = projecoes.stream()
                .map(p -> new CategoryStatsResponse(Category.valueOf(p.getCategory()), p.getCompleted(), p.getTotal()))
                .toList();

        int totalCompletado = porCategoria.stream().mapToInt(c -> (int) c.completed()).sum();
        int totalTopicos = porCategoria.stream().mapToInt(c -> (int) c.total()).sum();
        double percentual = totalTopicos == 0 ? 0 : (totalCompletado * 100.0) / totalTopicos;

        int streak = calcularStreak(userProgressRepository.findCompletedAtDatesBySessionId(sessionId));

        return new ProgressStatsResponse(porCategoria, totalCompletado, totalTopicos, percentual, streak);
    }

    // Streak = dias consecutivos com pelo menos 1 tópico completado, contando pra trás a
    // partir de hoje. Se hoje ainda não completou nada, o streak de ontem "ainda vale"
    // até a virada do dia (senão o usuário perderia o streak só por checar de manhã).
    private int calcularStreak(List<LocalDateTime> datasCompletadas) {
        if (datasCompletadas.isEmpty()) {
            return 0;
        }

        TreeSet<LocalDate> dias = new TreeSet<>();
        for (LocalDateTime data : datasCompletadas) {
            dias.add(data.toLocalDate());
        }

        LocalDate cursor = LocalDate.now();
        if (!dias.contains(cursor)) {
            cursor = cursor.minusDays(1);
        }

        int streak = 0;
        while (dias.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
