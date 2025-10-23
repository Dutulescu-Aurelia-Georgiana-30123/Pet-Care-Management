package com.petcare.controller;

import com.petcare.model.Pet;
import com.petcare.model.Owner;
import com.petcare.repository.PetRepository;
import com.petcare.repository.OwnerRepository;
import com.petcare.dto.PetDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private OwnerRepository ownerRepository;

    // ✅ GET - toate animalele
    @GetMapping
    public List<PetDTO> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ✅ GET - un animal după id
    @GetMapping("/{id}")
    public PetDTO getPetById(@PathVariable Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + id));
        return convertToDTO(pet);
    }

    // ✅ POST - adaugă un animal nou
    @PostMapping
    public PetDTO createPet(@RequestBody Pet pet) {
        // Salvează pet-ul
        Pet savedPet = petRepository.save(pet);

        // Încarcă explicit owner-ul complet din baza de date
        Owner owner = ownerRepository.findById(pet.getOwner().getId()).orElse(null);
        savedPet.setOwner(owner);

        // Transformă în DTO
        PetDTO dto = new PetDTO();
        dto.setId(savedPet.getId());
        dto.setName(savedPet.getName());
        dto.setSpecies(savedPet.getSpecies());
        dto.setBreed(savedPet.getBreed());
        dto.setOwnerName(owner != null ? owner.getName() : null);
        return dto;
    }

    // ✅ PUT - actualizează un animal existent
    @PutMapping("/{id}")
    public PetDTO updatePet(@PathVariable Long id, @RequestBody Pet petDetails) {
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

    // ✅ DELETE - șterge un animal
    @DeleteMapping("/{id}")
    public String deletePet(@PathVariable Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + id));

        petRepository.delete(pet);
        return "Pet with ID " + id + " deleted successfully.";
    }

    // 🔍 Custom Query - toate animalele unui anumit proprietar
    @GetMapping("/owner/{ownerId}")
    public List<PetDTO> getPetsByOwnerId(@PathVariable Long ownerId) {
        List<Pet> pets = petRepository.findByOwnerId(ownerId);
        return pets.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    // 🔄 Conversie Pet → PetDTO (metodă auxiliară)
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
