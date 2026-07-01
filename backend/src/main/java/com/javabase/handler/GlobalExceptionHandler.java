package com.javabase.handler;

import com.javabase.dto.ErrorResponse;
import com.javabase.exception.ClasseNaoPermitidaException;
import com.javabase.exception.ProgressAlreadyExistsException;
import com.javabase.exception.TopicNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// @RestControllerAdvice: intercepta exceções lançadas por qualquer @RestController
// e converte pra uma resposta HTTP padronizada, num único lugar.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TopicNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTopicNotFound(TopicNotFoundException ex) {
        ErrorResponse body = new ErrorResponse("TOPIC_NOT_FOUND", ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(ClasseNaoPermitidaException.class)
    public ResponseEntity<ErrorResponse> handleClasseNaoPermitida(ClasseNaoPermitidaException ex) {
        ErrorResponse body = new ErrorResponse("CLASS_NOT_ALLOWED", ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(ProgressAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleProgressAlreadyExists(ProgressAlreadyExistsException ex) {
        ErrorResponse body = new ErrorResponse("PROGRESS_ALREADY_EXISTS", ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(erro ->
                campos.put(erro.getField(), erro.getDefaultMessage()));

        ErrorResponse body = new ErrorResponse(
                "VALIDATION_ERROR",
                "Um ou mais campos são inválidos",
                LocalDateTime.now(),
                campos
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenerica(Exception ex) {
        // Sem stack trace no body — não expõe detalhes internos pro cliente
        ErrorResponse body = new ErrorResponse("INTERNAL_ERROR", "Erro interno do servidor", LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
