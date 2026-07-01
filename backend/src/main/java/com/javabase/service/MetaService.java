package com.javabase.service;

import com.javabase.dto.SourceCodeResponse;
import com.javabase.dto.StackEntryResponse;
import com.javabase.exception.ClasseNaoPermitidaException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * O diferencial do projeto: em vez de só EXPLICAR uma annotation, mostra ela funcionando
 * no código-fonte real deste próprio servidor. GET /meta/source/{className} lê o .java
 * de verdade do classpath (copiado lá pelo pom.xml em build-time) — não é uma cópia
 * congelada em string, é o arquivo que compilou o binário que está respondendo essa request.
 */
@Service
public class MetaService {

    // Só service/controller/config podem ser lidos — nunca entity, repository (menos didático)
    // nem qualquer coisa fora de com.javabase (evita expor código de bibliotecas de terceiros).
    private static final List<String> PACOTES_PERMITIDOS = List.of(
            "com.javabase.service",
            "com.javabase.controller",
            "com.javabase.config"
    );

    // Nome de classe simples só com letras/números — bloqueia "../" e qualquer tentativa
    // de path traversal antes mesmo de tocar no filesystem/classpath.
    private static final Pattern NOME_CLASSE_VALIDO = Pattern.compile("^[A-Za-z][A-Za-z0-9]*$");

    public Map<String, StackEntryResponse> obterStack() {
        Map<String, StackEntryResponse> stack = new LinkedHashMap<>();
        stack.put("java", new StackEntryResponse("21", "jvm-jre-jdk"));
        stack.put("spring-boot", new StackEntryResponse("3.4.1", "arquitetura-mvc"));
        stack.put("spring-data-jpa", new StackEntryResponse("3.4.1", "entity-repository-service-controller"));
        stack.put("spring-web", new StackEntryResponse("6.2.x", "http-metodos-get-post-put-delete"));
        stack.put("spring-cache-caffeine", new StackEntryResponse("3.1.8", "bean-e-anotacoes-basicas"));
        stack.put("postgresql", new StackEntryResponse("16", "sql-basico"));
        stack.put("maven", new StackEntryResponse("3.9.9", "maven"));
        stack.put("git", new StackEntryResponse("2.x", "git-commit-branch-merge-rebase"));
        return stack;
    }

    public SourceCodeResponse obterCodigoFonte(String className) {
        if (!NOME_CLASSE_VALIDO.matcher(className).matches()) {
            throw new ClasseNaoPermitidaException(className);
        }

        for (String pacote : PACOTES_PERMITIDOS) {
            String caminho = "sources/" + pacote.replace('.', '/') + "/" + className + ".java";
            ClassPathResource resource = new ClassPathResource(caminho);
            if (resource.exists()) {
                return new SourceCodeResponse(className, lerConteudo(resource, className));
            }
        }

        throw new ClasseNaoPermitidaException(className);
    }

    private String lerConteudo(ClassPathResource resource, String className) {
        try (InputStream in = resource.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao ler o source de " + className, e);
        }
    }
}
