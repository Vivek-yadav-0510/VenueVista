package com.venuevista.web;
import com.venuevista.model.Venue;
import com.venuevista.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
@RestController @RequestMapping("/api/venues") @RequiredArgsConstructor
public class VenueController {
  private final VenueRepository venues;
  private final EventRepository events;
  @GetMapping public List<Venue> list() { return venues.findAll(); }
  @PostMapping
  public Venue create(@RequestBody Venue v) {
    if (v.getName() == null || v.getName().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Venue name is required");
    if (v.getRowsCount() < 1 || v.getRowsCount() > 26 || v.getSeatsPerRow() < 1 || v.getSeatsPerRow() > 40)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use 1-26 rows and 1-40 seats per row");
    v.setId(null);
    return venues.save(v);
  }
  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    if (events.countByVenueId(id) > 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "This venue has events and can't be removed");
    venues.deleteById(id);
  }
}
