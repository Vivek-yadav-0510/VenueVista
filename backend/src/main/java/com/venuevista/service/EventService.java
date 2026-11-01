package com.venuevista.service;
import com.venuevista.model.*;
import com.venuevista.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional
public class EventService {
  private final EventRepository events;
  private final VenueRepository venues;
  private final TicketRepository tickets;

  public record EventReq(String title, String category, String description, LocalDateTime startTime,
                         Long venueId, BigDecimal basePrice, String imageUrl) {}
  public record EventDto(Long id, String title, String category, String description, LocalDateTime startTime,
                         Long venueId, String venueName, String city, BigDecimal basePrice, String imageUrl,
                         String status, long totalSeats, long soldSeats) {}
  public record SeatDto(Long id, String row, int number, String tier, BigDecimal price, String status) {}

  private EventDto toDto(Event e, long[] c) {
    Venue v = e.getVenue();
    return new EventDto(e.getId(), e.getTitle(), e.getCategory(), e.getDescription(), e.getStartTime(), v.getId(),
      v.getName(), v.getCity(), e.getBasePrice(), e.getImageUrl(), e.getStatus().name(), c[0], c[1]);
  }

  private Map<Long, long[]> counts() {
    Map<Long, long[]> m = new HashMap<>();
    for (Object[] r : tickets.countsByEvent()) {
      long[] c = m.computeIfAbsent((Long) r[0], k -> new long[2]);
      long n = (Long) r[2];
      c[0] += n;
      if (r[1] == Ticket.Status.SOLD) c[1] += n;
    }
    return m;
  }

  @Transactional(readOnly = true)
  public List<EventDto> list(String q, String category) {
    Map<Long, long[]> counts = counts();
    String needle = q == null ? "" : q.trim().toLowerCase();
    return events.findAllWithVenue().stream()
      .filter(e -> needle.isEmpty() || e.getTitle().toLowerCase().contains(needle)
        || e.getVenue().getName().toLowerCase().contains(needle) || e.getVenue().getCity().toLowerCase().contains(needle))
      .filter(e -> category == null || category.isBlank() || category.equalsIgnoreCase(e.getCategory()))
      .map(e -> toDto(e, counts.getOrDefault(e.getId(), new long[2]))).toList();
  }

  @Transactional(readOnly = true)
  public EventDto get(Long id) {
    Event e = events.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    long total = 0, sold = 0;
    for (Ticket t : tickets.findByEventIdOrderByRowLabelAscSeatNumberAsc(id)) { total++; if (t.getStatus() == Ticket.Status.SOLD) sold++; }
    return toDto(e, new long[]{total, sold});
  }

  @Transactional(readOnly = true)
  public List<SeatDto> seats(Long eventId) {
    return tickets.findByEventIdOrderByRowLabelAscSeatNumberAsc(eventId).stream()
      .map(t -> new SeatDto(t.getId(), t.getRowLabel(), t.getSeatNumber(), t.getTier().name(), t.getPrice(), t.getStatus().name())).toList();
  }

  /** Creates the event and generates its seating inventory from the venue layout, priced by tier. */
  public EventDto create(EventReq r) {
    if (r.title() == null || r.title().isBlank() || r.startTime() == null || r.venueId() == null || r.basePrice() == null)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, date, venue and base price are required");
    Venue v = venues.findById(r.venueId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Venue not found"));
    Event e = new Event();
    e.setTitle(r.title().trim()); e.setCategory(r.category()); e.setDescription(r.description());
    e.setStartTime(r.startTime()); e.setVenue(v); e.setBasePrice(r.basePrice()); e.setImageUrl(r.imageUrl());
    events.save(e);
    createSeats(e, v);
    return get(e.getId());
  }

  public void createSeats(Event e, Venue v) {
    int rows = v.getRowsCount();
    List<Ticket> list = new ArrayList<>();
    for (int i = 0; i < rows; i++) {
      Ticket.Tier tier = i < Math.ceil(rows * 0.2) ? Ticket.Tier.VIP : i < Math.ceil(rows * 0.6) ? Ticket.Tier.PREMIUM : Ticket.Tier.STANDARD;
      double mult = tier == Ticket.Tier.VIP ? 2.0 : tier == Ticket.Tier.PREMIUM ? 1.5 : 1.0;
      BigDecimal price = e.getBasePrice().multiply(BigDecimal.valueOf(mult)).setScale(2, RoundingMode.HALF_UP);
      String label = String.valueOf((char) ('A' + i));
      for (int s = 1; s <= v.getSeatsPerRow(); s++) {
        Ticket t = new Ticket();
        t.setEvent(e); t.setRowLabel(label); t.setSeatNumber(s); t.setTier(tier); t.setPrice(price);
        list.add(t);
      }
    }
    tickets.saveAll(list);
  }

  public void cancel(Long id) {
    Event e = events.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    e.setStatus(Event.Status.CANCELLED);
  }
}
