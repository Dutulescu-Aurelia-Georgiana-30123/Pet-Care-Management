package com.petcare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // folosim v1 și modelul gemini-1.5-flash
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=%s";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String analyzeSymptoms(String symptoms) {
        try {
            String url = String.format(GEMINI_URL, apiKey);

            String fullPrompt =
                    "Ești un asistent veterinar. Primești simptomele următoare de la stăpânul unui animal de companie: \""
                            + symptoms
                            + "\".\n"
                            + "Răspunde în română, pe scurt, cu:\n"
                            + "- o posibilă explicație (NU diagnostic oficial),\n"
                            + "- cât de urgent e (ex: „merge monitorizat acasă” / „mergi la veterinar cât mai repede”),\n"
                            + "- 2–3 recomandări generale.\n"
                            + "Nu inventa tratamente medicale, spune mereu să consulte un medic veterinar.";

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of(
                                    "parts", List.of(
                                            Map.of("text", fullPrompt)
                                    )
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(url, entity, String.class);

            // dacă Google răspunde cu eroare 4xx/5xx, vrem să vedem mesajul
            if (!response.getStatusCode().is2xxSuccessful()) {
                return "Gemini a răspuns cu eroare: " + response.getStatusCode().value()
                        + " - " + response.getBody();
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0)
                        .path("content")
                        .path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    JsonNode textNode = parts.get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            }

            return "Modelul nu a întors niciun text util.";
        } catch (Exception e) {
            e.printStackTrace();
            return "A apărut o eroare la comunicarea cu Gemini: " + e.getMessage();
        }
    }
}
