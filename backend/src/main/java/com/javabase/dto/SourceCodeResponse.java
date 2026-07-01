package com.javabase.dto;

public record SourceCodeResponse(
        String className,
        String sourceCode
) {
}
