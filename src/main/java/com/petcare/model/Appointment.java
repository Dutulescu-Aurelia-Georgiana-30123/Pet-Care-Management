package com.petcare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Appointment date and time is required.")
    private LocalDateTime dateTime;

    @NotBlank(message = "Appointment description is required.")
    private String description;

    @NotNull(message = "Owner is required.")
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @NotNull(message = "Pet is required.")
    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    public Appointment() {}

    public Appointment(LocalDateTime dateTime, String description, Owner owner, Pet pet) {
        this.dateTime = dateTime;
        this.description = description;
        this.owner = owner;
        this.pet = pet;
    }

    // --- Getteri și setteri ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Owner getOwner() { return owner; }
    public void setOwner(Owner owner) { this.owner = owner; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }
}
