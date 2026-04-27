package dk.ek.vurdering.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dk.ek.vurdering.dto.EvaluationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private static final String API_URL = "https://api.openai.com/v1/responses";
    private static final String MODEL = "gpt-4.1-nano";

    private final String apiKey;
    private final String systemPrompt;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAIService(@Value("${openai.api.key}") String apiKey) throws IOException {
        this.apiKey = apiKey;
        this.systemPrompt = loadResource("prompts/system-prompt.txt");
        this.objectMapper = new ObjectMapper();

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(60_000);
        this.restTemplate = new RestTemplate(factory);
    }

    public EvaluationResponse evaluate(String assignmentText) {
        Map<String, Object> requestBody = Map.of(
            "model", MODEL,
            "instructions", systemPrompt,
            "input", List.of(
                Map.of("role", "user", "content", "Vurdér den følgende praktikrapport ud fra rubricen i systemprompten. Returner svaret som json.\n\nPRAKTIKRAPPORT:\n\n" + assignmentText)
            ),
            "text", Map.of("format", Map.of("type", "json_object"))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        JsonNode responseBody = restTemplate.postForObject(API_URL, entity, JsonNode.class);

        String jsonText = responseBody
            .path("output").get(0)
            .path("content").get(0)
            .path("text").asText();

        try {
            return objectMapper.readValue(jsonText, EvaluationResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Kunne ikke parse svar fra OpenAI: " + e.getMessage(), e);
        }
    }

    private String loadResource(String path) throws IOException {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
            if (is == null) {
                throw new IOException("Ressourcefil ikke fundet: " + path);
            }
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
