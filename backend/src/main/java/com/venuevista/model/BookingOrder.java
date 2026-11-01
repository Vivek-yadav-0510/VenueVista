package com.venuevista.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
@Entity @Table(name = "BOOKING_ORDERS") @Getter @Setter @NoArgsConstructor
public class BookingOrder {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(unique = true) private String code;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private AppUser user;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Event event;
  @Column(precision = 12, scale = 2) private BigDecimal total;
  private LocalDateTime createdAt = LocalDateTime.now();
  @OneToMany(mappedBy = "order") private List<Ticket> tickets = new ArrayList<>();
}
