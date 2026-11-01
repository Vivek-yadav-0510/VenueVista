package com.venuevista.repo;
import com.venuevista.model.Event;
import org.springframework.data.jpa.repository.*;
import java.util.List;
public interface EventRepository extends JpaRepository<Event, Long> {
  @Query("select e from Event e join fetch e.venue order by e.startTime")
  List<Event> findAllWithVenue();
  long countByVenueId(Long venueId);
}
