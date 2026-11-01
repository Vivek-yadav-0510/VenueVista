package com.venuevista.model;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name = "VENUES") @Getter @Setter @NoArgsConstructor
public class Venue {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String name;
  private String city;
  private String address;
  private int rowsCount;      // seating chart: number of rows (A, B, C ...)
  private int seatsPerRow;    // seating chart: seats in each row
  @Transient public int getCapacity() { return rowsCount * seatsPerRow; }
}
