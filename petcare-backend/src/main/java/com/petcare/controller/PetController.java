package com.petcare.controller;

import com.petcare.model.Pet;
import com.petcare.model.Owner;
import com.petcare.repository.PetRepository;
import com.petcare.repository.OwnerRepository;
import com.petcare.repository.AppointmentRepository;
import com.petcare.dto.PetDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.petcare.exception.ValidationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = {
        "http://localhost:5173", // admin app
        "http://localhost:5174"   // client app
})

public class PetController {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // GET - toate animalele
    @GetMapping
    public List<PetDTO> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

   /* // GET - un animal după id
    @GetMapping("/{id}")
    public PetDTO getPetById(@PathVariable Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + id));
        return convertToDTO(pet);
    }*/

    //POST - adaugă un animal nou
    @PostMapping
    public PetDTO createPet(@Valid @RequestBody Pet pet) {
        if (pet.getOwner() == null || pet.getOwner().getId() == null) {
            throw new ValidationException("Owner must be specified for the pet.");
        }
        Pet savedPet = petRepository.save(pet);

        Owner owner = ownerRepository.findById(pet.getOwner().getId()).orElseThrow(() -> new ValidationException("Owner not found for ID: " + pet.getOwner().getId()));
        savedPet.setOwner(owner);

        PetDTO dto = new PetDTO();
        dto.setId(savedPet.getId());
        dto.setName(savedPet.getName());
        dto.setSpecies(savedPet.getSpecies());
        dto.setBreed(savedPet.getBreed());
        dto.setOwnerName(owner != null ? owner.getName() : null);
        return dto;
    }

    // PUT-actualizează un animal existent
    @PutMapping("/{id}")
    public PetDTO updatePet(@PathVariable Long id, @Valid @RequestBody Pet petDetails) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + id));

        pet.setName(petDetails.getName());
        pet.setSpecies(petDetails.getSpecies());
        pet.setBreed(petDetails.getBreed());

        if (petDetails.getOwner() != null && petDetails.getOwner().getId() != null) {
            Optional<Owner> owner = ownerRepository.findById(petDetails.getOwner().getId());
            owner.ifPresent(pet::setOwner);
        }

        Pet updated = petRepository.save(pet);
        return convertToDTO(updated);
    }

    //DELETE-șterge un animal
    @Transactional
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id) {

        if (!petRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Pet not found.");
        }

        // ștergem toate programările acestui pet
        appointmentRepository.deleteByPetId(id);

        // ștergem pet-ul
        petRepository.deleteById(id);

        return ResponseEntity.ok("Pet deleted successfully.");
    }

    // toate animalele unui anumit proprietar
    @GetMapping("/owner/{ownerId}")
    public List<PetDTO> getPetsByOwnerId(@PathVariable Long ownerId) {
        List<Pet> pets = petRepository.findByOwnerId(ownerId);
        return pets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    //Conversie Pet → PetDTO
    private PetDTO convertToDTO(Pet pet) {
        return new PetDTO(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getOwner() != null ? pet.getOwner().getName() : null
        );
    }
}
