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

    @NotNull(message = "Data și ora programării sunt obligatorii.")
    @FutureOrPresent(message = "Programarea nu poate fi în trecut.")
    private LocalDateTime dateTime;
    @NotBlank(message = "Descrierea este obligatorie.")
    private String description;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @NotNull(message = "Trebuie să alegi un proprietar pentru programare.")
    private Owner owner;

    @ManyToOne
    @JoinColumn(name = "pet_id")
    @NotNull(message = "Trebuie să alegi un animal pentru programare.")
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
