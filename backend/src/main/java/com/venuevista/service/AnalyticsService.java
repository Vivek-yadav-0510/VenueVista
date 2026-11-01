package com.venuevista.service;
import com.venuevista.model.*;
import com.venuevista.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class AnalyticsService {
  private final TicketRepository tickets;
  private final OrderRepository orders;
  private final EventRepository events;

  public record Kpis(BigDecimal revenue, long ticketsSold, long totalSeats, double occupancy, long events, BigDecimal avgOrder) {}
  public record EventRevenue(String title, BigDecimal revenue, long sold, long capacity) {}
  public record Daily(LocalDate date, BigDecimal revenue, long orders) {}
  public record Summary(Kpis kpis, List<EventRevenue> topEvents, List<Daily> daily, Map<String, Long> soldByTier) {}

  public Summary summary() {
    List<Ticket> sold = tickets.withStatus(Ticket.Status.SOLD);
    long total = tickets.count();
    BigDecimal revenue = sold.stream().map(Ticket::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
    List<BookingOrder> all = orders.findAll();

    Map<Long, long[]> cap = new HashMap<>();
    for (Object[] r : tickets.countsByEvent()) cap.computeIfAbsent((Long) r[0], k -> new long[1])[0] += (Long) r[2];

    List<EventRevenue> top = sold.stream().collect(Collectors.groupingBy(t -> t.getEvent())).entrySet().stream()
      .map(en -> new EventRevenue(en.getKey().getTitle(),
        en.getValue().stream().map(Ticket::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add),
        en.getValue().size(), cap.getOrDefault(en.getKey().getId(), new long[1])[0]))
      .sorted(Comparator.comparing(EventRevenue::revenue).reversed()).limit(6).toList();

    LocalDate today = LocalDate.now();
    List<Daily> daily = new ArrayList<>();
    for (int i = 13; i >= 0; i--) {
      LocalDate d = today.minusDays(i);
      List<BookingOrder> day = all.stream().filter(o -> o.getCreatedAt().toLocalDate().equals(d)).toList();
      daily.add(new Daily(d, day.stream().map(BookingOrder::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add), day.size()));
    }
    Map<String, Long> byTier = new LinkedHashMap<>();
    for (Ticket.Tier t : Ticket.Tier.values()) byTier.put(t.name(), sold.stream().filter(x -> x.getTier() == t).count());

    BigDecimal avg = all.isEmpty() ? BigDecimal.ZERO : revenue.divide(BigDecimal.valueOf(all.size()), 2, java.math.RoundingMode.HALF_UP);
    double occ = total == 0 ? 0 : Math.round(sold.size() * 1000.0 / total) / 10.0;
    return new Summary(new Kpis(revenue, sold.size(), total, occ, events.count(), avg), top, daily, byTier);
  }
}
