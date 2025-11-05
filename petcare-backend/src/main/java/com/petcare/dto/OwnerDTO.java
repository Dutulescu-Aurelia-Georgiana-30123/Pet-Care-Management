package com.petcare.dto;

import java.util.List;

public class OwnerDTO {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private List<String> petNames;

    public OwnerDTO(Long id, String name, String phone, String email, List<String> petNames) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.petNames = petNames;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getPetNames() { return petNames; }
    public void setPetNames(List<String> petNames) { this.petNames = petNames; }
}
