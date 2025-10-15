
package com.petcare.controller;

import com.petcare.dto.AppointmentDTO;
import com.petcare.model.Appointment;
import com.petcare.repository.AppointmentRepository;
import com.petcare.repository.OwnerRepository;
import com.petcare.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return appointmentRepository.save(appointment);
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
    public AppointmentDTO updateAppointment(@PathVariable Long id, @RequestBody Appointment updatedAppointment) {
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



}
