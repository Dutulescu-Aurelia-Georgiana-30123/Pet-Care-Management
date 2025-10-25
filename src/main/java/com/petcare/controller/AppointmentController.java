
package com.petcare.controller;

import com.petcare.dto.AppointmentDTO;
import com.petcare.model.Appointment;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.OwnerRepository;
import com.petcare.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
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
        // Încarcă owner-ul complet din DB
        if (appointment.getOwner() != null && appointment.getOwner().getId() != null) {
            appointment.setOwner(
                    ownerRepository.findById(appointment.getOwner().getId())
                            .orElseThrow(() -> new RuntimeException("Owner not found"))
            );
        }

        // Încarcă pet-ul complet din DB
        if (appointment.getPet() != null && appointment.getPet().getId() != null) {
            appointment.setPet(
                    petRepository.findById(appointment.getPet().getId())
                            .orElseThrow(() -> new RuntimeException("Pet not found"))
            );
        }

        // Salvează programarea
        Appointment saved = appointmentRepository.save(appointment);

        // Returnează un DTO frumos complet
        return new AppointmentDTO(
                saved.getId(),
                saved.getDateTime(),
                saved.getDescription(),
                saved.getOwner() != null ? saved.getOwner().getName() : null,
                saved.getPet() != null ? saved.getPet().getName() : null
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
                .map(appointment -> {
                    appointment.setDateTime(updatedAppointment.getDateTime());
                    appointment.setDescription(updatedAppointment.getDescription());

                    if (updatedAppointment.getOwner() != null && updatedAppointment.getOwner().getId() != null) {
                        appointment.setOwner(
                                ownerRepository.findById(updatedAppointment.getOwner().getId())
                                        .orElse(null)
                        );
                    }

                    if (updatedAppointment.getPet() != null && updatedAppointment.getPet().getId() != null) {
                        appointment.setPet(
                                petRepository.findById(updatedAppointment.getPet().getId())
                                        .orElse(null)
                        );
                    }

                    Appointment saved = appointmentRepository.save(appointment);

                    return new AppointmentDTO(
                            saved.getId(),
                            saved.getDateTime(),
                            saved.getDescription(),
                            saved.getOwner() != null ? saved.getOwner().getName() : null,
                            saved.getPet() != null ? saved.getPet().getName() : null
                    );
                })
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    // ✅ Custom query - toate programările pentru un anumit owner
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
