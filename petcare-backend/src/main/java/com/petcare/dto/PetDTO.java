package com.petcare.dto;

public class PetDTO {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private String ownerName;

    public PetDTO() {}

    public PetDTO(Long id, String name, String species, String breed, String ownerName) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.ownerName = ownerName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
}
