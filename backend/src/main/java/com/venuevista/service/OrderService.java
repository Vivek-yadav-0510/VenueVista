package com.venuevista.service;
import com.venuevista.model.*;
import com.venuevista.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional
public class OrderService {
  private final OrderRepository orders;
  private final TicketRepository tickets;
  private final EventRepository events;
  private final UserRepository users;

  public record OrderReq(Long eventId, List<Long> seatIds) {}
  public record SeatLine(String label, String tier, BigDecimal price) {}
  public record OrderDto(Long id, String code, Long eventId, String eventTitle, LocalDateTime startTime, String venueName,
                         String city, BigDecimal total, LocalDateTime createdAt, List<SeatLine> seats) {}

  public OrderDto place(String email, OrderReq r) {
    AppUser u = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    if (r.seatIds() == null || r.seatIds().isEmpty() || r.seatIds().size() > 8)
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose between 1 and 8 seats");
    Event ev = events.findById(r.eventId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    if (ev.getStatus() != Event.Status.ACTIVE) throw new ResponseStatusException(HttpStatus.CONFLICT, "This event has been cancelled");
    if (ev.getStartTime().isBefore(LocalDateTime.now())) throw new ResponseStatusException(HttpStatus.CONFLICT, "This event has already started");

    List<Ticket> ts = tickets.lockAll(new ArrayList<>(new LinkedHashSet<>(r.seatIds())));  // row locks prevent double-selling
    if (ts.size() != new HashSet<>(r.seatIds()).size() || ts.stream().anyMatch(t -> !t.getEvent().getId().equals(ev.getId())))
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some seats don't belong to this event");
    if (ts.stream().anyMatch(t -> t.getStatus() != Ticket.Status.AVAILABLE))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Someone just booked one of those seats. Pick different seats.");

    BookingOrder o = new BookingOrder();
    o.setUser(u); o.setEvent(ev); o.setCode("VV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    o.setTotal(ts.stream().map(Ticket::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add));
    orders.save(o);
    for (Ticket t : ts) { t.setStatus(Ticket.Status.SOLD); t.setOrder(o); }
    o.setTickets(ts);
    return toDto(o);
  }

  @Transactional(readOnly = true)
  public List<OrderDto> mine(String email) {
    AppUser u = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    return orders.findByUserIdOrderByCreatedAtDesc(u.getId()).stream().map(this::toDto).toList();
  }

  OrderDto toDto(BookingOrder o) {
    Event e = o.getEvent();
    List<SeatLine> seats = o.getTickets().stream()
      .sorted(Comparator.comparing(Ticket::getRowLabel).thenComparingInt(Ticket::getSeatNumber))
      .map(t -> new SeatLine(t.label(), t.getTier().name(), t.getPrice())).toList();
    return new OrderDto(o.getId(), o.getCode(), e.getId(), e.getTitle(), e.getStartTime(), e.getVenue().getName(),
      e.getVenue().getCity(), o.getTotal(), o.getCreatedAt(), seats);
  }
}
