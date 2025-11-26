package com.petcare.controller;

import com.petcare.dto.LoginRequest;
import com.petcare.dto.RegisterRequest;
import com.petcare.dto.OwnerDTO;
import com.petcare.model.Owner;
import com.petcare.repository.OwnerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins =
        {"http://localhost:5173", //port admin
                "http://localhost:5174" //port client

        })
public class AuthController {

    private final OwnerRepository ownerRepository;

    public AuthController(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    // ------------- REGISTER -------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        // email unic
        if (ownerRepository.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("Email already exists");
        }

        // validări simple
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Name is required");
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        Owner o = new Owner();
        o.setName(req.getName());
        o.setPhone(req.getPhone());
        o.setEmail(req.getEmail());
        o.setPassword(req.getPassword()); // pentru proiect lăsăm plain-text

        Owner saved = ownerRepository.save(o);

        OwnerDTO dto = new OwnerDTO(
                saved.getId(),
                saved.getName(),
                saved.getPhone(),
                saved.getEmail(),
                saved.getPets() != null
                        ? saved.getPets().stream().map(p -> p.getName()).toList()
                        : java.util.Collections.emptyList()
        );

        return ResponseEntity.ok(dto);
    }

    // ------------- LOGIN -------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<Owner> opt = ownerRepository.findByEmail(req.getEmail());

        if (opt.isEmpty()) {
            // nu dăm mesaj diferit pentru mail/parolă ca să nu "dezvăluim" ce email există
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        Owner owner = opt.get();
        String pwd = owner.getPassword();

        if (pwd == null || !pwd.equals(req.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        OwnerDTO dto = new OwnerDTO(
                owner.getId(),
                owner.getName(),
                owner.getPhone(),
                owner.getEmail(),
                owner.getPets() != null
                        ? owner.getPets().stream().map(p -> p.getName()).toList()
                        : java.util.Collections.emptyList()
        );

        return ResponseEntity.ok(dto);
    }
}
