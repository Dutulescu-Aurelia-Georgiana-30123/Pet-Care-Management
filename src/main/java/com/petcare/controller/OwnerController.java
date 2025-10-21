package com.petcare.controller;

import com.petcare.dto.OwnerDTO;
import com.petcare.model.Owner;
import com.petcare.repository.OwnerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin(origins = "*")
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

    @PostMapping
    public Owner create(@RequestBody Owner owner) {
        // dacă owner.pets are elemente, cascade se va ocupa
        return ownerRepository.save(owner);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Owner> update(@PathVariable Long id, @RequestBody Owner ownerData) {
        return ownerRepository.findById(id).map(owner -> {
            owner.setName(ownerData.getName());
            owner.setPhone(ownerData.getPhone());
            owner.setEmail(ownerData.getEmail());
            Owner saved = ownerRepository.save(owner);
            return ResponseEntity.ok(saved);
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
