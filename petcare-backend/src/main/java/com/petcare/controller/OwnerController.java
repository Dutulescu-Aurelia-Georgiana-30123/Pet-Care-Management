package com.petcare.controller;

import com.petcare.dto.OwnerDTO;
import com.petcare.model.Owner;
import com.petcare.repository.OwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin(origins = "http://localhost:5173")
public class OwnerController {

    private final OwnerRepository ownerRepository;

    public OwnerController(OwnerRepository ownerRepository) {
        this.ownerRepository = ownerRepository;
    }

    @GetMapping
    public List<OwnerDTO> getAllOwners() {
        return ownerRepository.findAll().stream()
                .map(owner -> new OwnerDTO(
                        owner.getId(),
                        owner.getName(),
                        owner.getPhone(),
                        owner.getEmail(),
                        owner.getPets().stream()
                                .map(p -> p.getName())
                                .toList()
                ))
                .toList();
    }

    // POST - creare owner cu validare
    @PostMapping
    public ResponseEntity<?> createOwner(@Valid @RequestBody Owner owner) {
        if (ownerRepository.findByEmail(owner.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body("Email already exists");
        }
        Owner saved = ownerRepository.save(owner);
        return ResponseEntity.ok(saved);
    }

    // PUT - actualizare owner cu validare
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOwner(@PathVariable Long id, @Valid @RequestBody Owner ownerDetails) {
        return ownerRepository.findById(id).map(owner -> {
            // verifică dacă email-ul se schimbă și dacă cel nou este deja folosit de alt owner
            if (ownerDetails.getEmail() != null && !ownerDetails.getEmail().equals(owner.getEmail())) {
                if (ownerRepository.findByEmail(ownerDetails.getEmail()).isPresent()) {
                    return ResponseEntity.status(409).body("Email already exists");
                }
            }
            owner.setName(ownerDetails.getName());
            owner.setPhone(ownerDetails.getPhone());
            owner.setEmail(ownerDetails.getEmail());
            ownerRepository.save(owner);
            return ResponseEntity.ok(owner);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (ownerRepository.existsById(id)) {
            ownerRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
