package com.venuevista.repo;
import com.venuevista.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VenueRepository extends JpaRepository<Venue, Long> {}
