package com.petcare.controller;

import com.petcare.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
        // @CrossOrigin(origins = "*")
})
public class AiController {

    private final ChatbotService chatbotService;

    public AiController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/symptoms")
    public ResponseEntity<?> analyzeSymptoms(@RequestBody Map<String, String> body) {
        String symptoms = body.get("symptoms");

        if (symptoms == null || symptoms.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Câmpul 'symptoms' este obligatoriu."));
        }

        String answer = chatbotService.analyzeSymptoms(symptoms);

        return ResponseEntity.ok(Map.of(
                "symptoms", symptoms,
                "answer", answer
        ));
    }
}
