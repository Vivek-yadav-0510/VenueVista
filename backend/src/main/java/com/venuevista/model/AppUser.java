package com.venuevista.model;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name = "APP_USERS") @Getter @Setter @NoArgsConstructor
public class AppUser {
  public enum Role { ADMIN, ORGANIZER, CUSTOMER }
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String name;
  @Column(nullable = false, unique = true) private String email;
  @Column(nullable = false) private String passwordHash;
  @Enumerated(EnumType.STRING) private Role role = Role.CUSTOMER;
}
