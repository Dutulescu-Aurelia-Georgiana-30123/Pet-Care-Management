package com.petcare.repository;

import com.petcare.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    //caută toate programările pentru un anumit owner
    List<Appointment> findByPetOwnerId(Long ownerId);
    void deleteByPetId(Long petId);
}
