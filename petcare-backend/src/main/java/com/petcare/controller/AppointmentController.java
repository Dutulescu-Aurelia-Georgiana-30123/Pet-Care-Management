
package com.petcare.controller;

import com.petcare.dto.AppointmentDTO;
import com.petcare.model.Appointment;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.OwnerRepository;
import com.petcare.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.petcare.exception.ValidationException;

import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {
        "http://localhost:5173", // admin app
        "http://localhost:5174"   // client app
})
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private OwnerRepository ownerRepository;

    @Autowired
    private PetRepository petRepository;


    //  GET - returnează toate programările în format DTO
    @GetMapping
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(a -> new AppointmentDTO(
                        a.getId(),
                        a.getDateTime(),
                        a.getDescription(),
                        a.getOwner() != null ? a.getOwner().getName() : null,
                        a.getPet() != null ? a.getPet().getName() : null
                ))
                .collect(Collectors.toList());
    }

    //  POST - adaugă o programare nouă
    @PostMapping
    public AppointmentDTO createAppointment(@Valid @RequestBody Appointment appointment) {

        // Validări de bază
        if (appointment.getDateTime() == null) {
            throw new ValidationException("Appointment date and time must be specified.");
        }
        if (appointment.getDateTime().isBefore(java.time.LocalDateTime.now())) {
            throw new ValidationException("Appointment date and time cannot be in the past.");
        }
        if (appointment.getDescription() == null || appointment.getDescription().trim().isEmpty()) {
            throw new ValidationException("Appointment description is required.");
        }

        // Verifică existența ownerului
        if (appointment.getOwner() == null || appointment.getOwner().getId() == null) {
            throw new ValidationException("Owner must be specified for the appointment.");
        }

        // Verifică existența animalului
        if (appointment.getPet() == null || appointment.getPet().getId() == null) {
            throw new ValidationException("Pet must be specified for the appointment.");
        }

        // Caută ownerul și pet-ul în baza de date
        var owner = ownerRepository.findById(appointment.getOwner().getId())
                .orElseThrow(() -> new ValidationException("Owner not found for ID: " + appointment.getOwner().getId()));

        var pet = petRepository.findById(appointment.getPet().getId())
                .orElseThrow(() -> new ValidationException("Pet not found for ID: " + appointment.getPet().getId()));

        // Asociază entitățile verificate
        appointment.setOwner(owner);
        appointment.setPet(pet);

        Appointment saved = appointmentRepository.save(appointment);

        return new AppointmentDTO(
                saved.getId(),
                saved.getDateTime(),
                saved.getDescription(),
                owner.getName(),
                pet.getName()
        );
    }

    // DELETE - șterge o programare după ID
    @DeleteMapping("/{id}")
    public String deleteAppointment(@PathVariable Long id) {
        if (!appointmentRepository.existsById(id)) {
            return "Appointment not found!";
        }
        appointmentRepository.deleteById(id);
        return "Appointment deleted successfully!";
    }

    // PUT - actualizează o programare după ID
    @PutMapping("/{id}")
    public AppointmentDTO updateAppointment(@PathVariable Long id, @Valid @RequestBody Appointment updatedAppointment) {

        return appointmentRepository.findById(id)
                .map(existing -> {

                    if (updatedAppointment.getDateTime() == null) {
                        throw new ValidationException("Appointment date and time must be specified.");
                    }
                    if (updatedAppointment.getDateTime().isBefore(java.time.LocalDateTime.now())) {
                        throw new ValidationException("Appointment date and time cannot be in the past.");
                    }
                    if (updatedAppointment.getDescription() == null || updatedAppointment.getDescription().trim().isEmpty()) {
                        throw new ValidationException("Appointment description is required.");
                    }

                    existing.setDateTime(updatedAppointment.getDateTime());
                    existing.setDescription(updatedAppointment.getDescription());

                    if (updatedAppointment.getOwner() != null && updatedAppointment.getOwner().getId() != null) {
                        var owner = ownerRepository.findById(updatedAppointment.getOwner().getId())
                                .orElseThrow(() -> new ValidationException("Owner not found for ID: " + updatedAppointment.getOwner().getId()));
                        existing.setOwner(owner);
                    }

                    if (updatedAppointment.getPet() != null && updatedAppointment.getPet().getId() != null) {
                        var pet = petRepository.findById(updatedAppointment.getPet().getId())
                                .orElseThrow(() -> new ValidationException("Pet not found for ID: " + updatedAppointment.getPet().getId()));
                        existing.setPet(pet);
                    }

                    Appointment saved = appointmentRepository.save(existing);

                    return new AppointmentDTO(
                            saved.getId(),
                            saved.getDateTime(),
                            saved.getDescription(),
                            saved.getOwner() != null ? saved.getOwner().getName() : null,
                            saved.getPet() != null ? saved.getPet().getName() : null
                    );
                })
                .orElseThrow(() -> new ValidationException("Appointment not found with ID: " + id));
    }


    // toate programările pentru un anumit owner
    @GetMapping("/owner/{ownerId}")
    public List<AppointmentDTO> getAppointmentsByOwner(@PathVariable Long ownerId) {
        return appointmentRepository.findByPetOwnerId(ownerId).stream()
                .map(a -> new AppointmentDTO(
                        a.getId(),
                        a.getDateTime(),
                        a.getDescription(),
                        a.getOwner() != null ? a.getOwner().getName() : null,
                        a.getPet() != null ? a.getPet().getName() : null
                ))
                .collect(Collectors.toList());
    }



}
