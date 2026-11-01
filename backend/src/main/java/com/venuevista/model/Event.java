package com.venuevista.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name = "EVENTS") @Getter @Setter @NoArgsConstructor
public class Event {
  public enum Status { ACTIVE, CANCELLED }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String title;
  private String category;
  @Column(length = 2000) private String description;
  @Column(nullable = false) private LocalDateTime startTime;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) private Venue venue;
  @Column(precision = 10, scale = 2) private BigDecimal basePrice;
  private String imageUrl;
  @Enumerated(EnumType.STRING) private Status status = Status.ACTIVE;
}
