package com.petcare.repository;

import com.petcare.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    // Custom query: găsește toate animalele unui proprietar
    List<Pet> findByOwnerId(Long ownerId);
}
