package com.venuevista.service;
import com.venuevista.model.*;
import com.venuevista.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
/** Seeds demo accounts, venues, events and a fortnight of sales so the dashboard is alive on first run. */
@Component @RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
  private final UserRepository users; private final VenueRepository venues; private final EventRepository events;
  private final TicketRepository tickets; private final OrderRepository orders;
  private final EventService eventService; private final PasswordEncoder enc;

  private AppUser user(String name, String email, String pw, AppUser.Role role) {
    AppUser u = new AppUser(); u.setName(name); u.setEmail(email); u.setPasswordHash(enc.encode(pw)); u.setRole(role); return users.save(u);
  }
  private Venue venue(String n, String city, String addr, int rows, int seats) {
    Venue v = new Venue(); v.setName(n); v.setCity(city); v.setAddress(addr); v.setRowsCount(rows); v.setSeatsPerRow(seats); return venues.save(v);
  }

  @Override @Transactional
  public void run(String... args) {
    if (users.count() > 0) return;
    user("Asha Admin", "admin@venuevista.com", "Admin@123", AppUser.Role.ADMIN);
    user("Omar Organizer", "organizer@venuevista.com", "Organizer@123", AppUser.Role.ORGANIZER);
    List<AppUser> fans = List.of(
      user("Riya Sharma", "customer@venuevista.com", "Customer@123", AppUser.Role.CUSTOMER),
      user("Kabir Malhotra", "kabir@example.com", "Customer@123", AppUser.Role.CUSTOMER),
      user("Meera Iyer", "meera@example.com", "Customer@123", AppUser.Role.CUSTOMER));

    Venue grand = venue("Kamani Auditorium", "New Delhi", "1 Copernicus Marg", 12, 20);
    Venue arena = venue("Jawaharlal Nehru Indoor Arena", "New Delhi", "Lodhi Road", 16, 28);
    Venue club  = venue("Blue Room Live", "Gurugram", "Cyber Hub, DLF Phase 2", 8, 14);

    Object[][] seed = {
      {"Midnight Raga: A Sitar & Strings Evening", "Concert", "An immersive night of classical sitar with a live string ensemble.", 6, 20, grand, 1200},
      {"Delhi Comedy Carnival", "Comedy", "Six of the country's sharpest stand-ups on one stage.", 10, 20, club, 800},
      {"The Last Metro: A Stage Play", "Theatre", "A gripping original drama set on the final train home.", 14, 19, grand, 650},
      {"Neon Pulse Festival Night", "Festival", "Electronic headliners, laser stage and a 4-hour closing set.", 21, 20, arena, 1800},
      {"Premier Basketball Finals — Game 3", "Sports", "The series is level. Game 3 decides momentum.", 27, 19, arena, 1500},
      {"Indie Unplugged Sessions", "Concert", "Intimate acoustic sets from three emerging bands.", 3, 20, club, 500},
    };
    Random rnd = new Random(7);
    for (Object[] s : seed) {
      Event e = new Event(); e.setTitle((String) s[0]); e.setCategory((String) s[1]); e.setDescription((String) s[2]);
      e.setStartTime(LocalDateTime.now().plusDays((Integer) s[3]).withHour((Integer) s[4]).withMinute(0).withSecond(0).withNano(0));
      e.setVenue((Venue) s[5]); e.setBasePrice(BigDecimal.valueOf((Integer) s[6])); events.save(e);
      eventService.createSeats(e, (Venue) s[5]);

      List<Ticket> all = tickets.findByEventIdOrderByRowLabelAscSeatNumberAsc(e.getId());
      Collections.shuffle(all, rnd);
      int target = (int) (all.size() * (0.3 + rnd.nextDouble() * 0.4));
      for (int i = 0; i < target; ) {
        int n = Math.min(1 + rnd.nextInt(4), target - i);
        List<Ticket> group = all.subList(i, i + n);
        BookingOrder o = new BookingOrder();
        o.setUser(fans.get(rnd.nextInt(fans.size()))); o.setEvent(e);
        o.setCode("VV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        o.setCreatedAt(LocalDateTime.now().minusDays(rnd.nextInt(14)).minusMinutes(rnd.nextInt(600)));
        o.setTotal(group.stream().map(Ticket::getPrice).reduce(BigDecimal.ZERO, BigDecimal::add));
        orders.save(o);
        for (Ticket t : group) { t.setStatus(Ticket.Status.SOLD); t.setOrder(o); }
        i += n;
      }
    }
  }
}
