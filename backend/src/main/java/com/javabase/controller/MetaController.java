package com.javabase.controller;

import com.javabase.dto.SourceCodeResponse;
import com.javabase.dto.StackEntryResponse;
import com.javabase.service.MetaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// O diferencial do JavaBase: expõe metadados e código-fonte real do próprio backend.
@RestController
@RequestMapping("/api/v1/meta")
public class MetaController {

    private final MetaService metaService;

    public MetaController(MetaService metaService) {
        this.metaService = metaService;
    }

    @GetMapping("/stack")
    public Map<String, StackEntryResponse> obterStack() {
        return metaService.obterStack();
    }

    @GetMapping("/source/{className}")
    public SourceCodeResponse obterCodigoFonte(@PathVariable String className) {
        return metaService.obterCodigoFonte(className);
    }
}
