package com.petcare.dto;

import java.time.LocalDateTime;

public class AppointmentDTO {
    private Long id;
    private LocalDateTime dateTime;
    private String description;
    private String ownerName;
    private String petName;

    public AppointmentDTO(Long id, LocalDateTime dateTime, String description, String ownerName, String petName) {
        this.id = id;
        this.dateTime = dateTime;
        this.description = description;
        this.ownerName = ownerName;
        this.petName = petName;
    }

    // Getters
    public Long getId() { return id; }
    public LocalDateTime getDateTime() { return dateTime; }
    public String getDescription() { return description; }
    public String getOwnerName() { return ownerName; }
    public String getPetName() { return petName; }
}
