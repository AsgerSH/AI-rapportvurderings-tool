package dk.ek.vurdering.controller;

import dk.ek.vurdering.dto.EvaluationRequest;
import dk.ek.vurdering.dto.EvaluationResponse;
import dk.ek.vurdering.service.OpenAIService;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EvaluationController {

    private final OpenAIService openAIService;

    public EvaluationController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/evaluations")
    public ResponseEntity<?> evaluate(@RequestBody EvaluationRequest request) {
        if (request.getText() == null || request.getText().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Opgavetekst må ikke være tom"));
        }
        try {
            EvaluationResponse response = openAIService.evaluate(request.getText());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Fejl ved kald til OpenAI: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/evaluations/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> evaluateFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Filen er tom"));
        }

        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        try {
            String text;
            if (filename.endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    text = new PDFTextStripper().getText(doc);
                }
            } else if (filename.endsWith(".md") || filename.endsWith(".txt")) {
                text = new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Kun .pdf, .md og .txt filer er understøttet"));
            }

            if (text.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ingen tekst fundet i filen"));
            }

            EvaluationResponse response = openAIService.evaluate(text);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Fejl ved behandling af fil: " + e.getMessage()));
        }
    }
}
