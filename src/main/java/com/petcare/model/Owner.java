package com.petcare.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "owners",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email") // email trebuie să fie unic
        }
)
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Numele este obligatoriu.")
    @Size(min = 2, max = 50, message = "Numele trebuie să aibă între 2 și 50 de caractere.")
    private String name;

    @NotBlank(message = "Numărul de telefon este obligatoriu.")
    @Pattern(regexp = "^(\\+4)?07\\d{8}$", message = "Numărul de telefon trebuie să fie valid (ex: 07xxxxxxxx).")
    private String phone;

    @NotBlank(message = "Emailul este obligatoriu.")
    @Email(message = "Adresa de email nu este validă.")
    private String email;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Pet> pets = new ArrayList<>();

    public Owner() {}

    public Owner(String name, String phone, String email) {
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    // --- Getteri și setteri ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<Pet> getPets() { return pets; }
    public void setPets(List<Pet> pets) { this.pets = pets; }

    public void addPet(Pet pet) {
        pets.add(pet);
        pet.setOwner(this);
    }

    public void removePet(Pet pet) {
        pets.remove(pet);
        pet.setOwner(null);
    }
}
