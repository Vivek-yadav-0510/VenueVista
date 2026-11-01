package com.venuevista.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
@Entity @Table(name = "TICKETS") @Getter @Setter @NoArgsConstructor
public class Ticket {
  public enum Tier { STANDARD, PREMIUM, VIP }
  public enum Status { AVAILABLE, SOLD }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Event event;
  private String rowLabel;
  private int seatNumber;
  @Enumerated(EnumType.STRING) private Tier tier;
  @Column(precision = 10, scale = 2) private BigDecimal price;
  @Enumerated(EnumType.STRING) private Status status = Status.AVAILABLE;
  @ManyToOne(fetch = FetchType.LAZY) private BookingOrder order;
  public String label() { return rowLabel + seatNumber; }
}
