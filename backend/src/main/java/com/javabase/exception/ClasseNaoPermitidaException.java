package com.javabase.exception;

// Lançada pelo MetaController quando alguém pede o source de uma classe
// fora da whitelist (ver MetaService) — evita path traversal / leitura arbitrária do classpath.
public class ClasseNaoPermitidaException extends RuntimeException {

    public ClasseNaoPermitidaException(String className) {
        super("Classe '%s' não está na whitelist de código-fonte exposto".formatted(className));
    }
}
