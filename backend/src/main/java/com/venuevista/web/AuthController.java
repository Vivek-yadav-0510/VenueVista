package com.venuevista.web;
import com.venuevista.model.AppUser;
import com.venuevista.repo.UserRepository;
import com.venuevista.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;
  public record RegisterReq(@NotBlank String name, @Email @NotBlank String email, @Size(min = 8) String password, String role) {}
  public record LoginReq(@NotBlank String email, @NotBlank String password) {}
  public record AuthRes(String token, String name, String email, String role) {}

  @PostMapping("/register")
  public AuthRes register(@Valid @RequestBody RegisterReq r) {
    String email = r.email().trim().toLowerCase();
    if (users.existsByEmail(email)) throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
    AppUser u = new AppUser();
    u.setName(r.name().trim()); u.setEmail(email); u.setPasswordHash(encoder.encode(r.password()));
    u.setRole("ORGANIZER".equalsIgnoreCase(r.role()) ? AppUser.Role.ORGANIZER : AppUser.Role.CUSTOMER);  // ADMIN can't self-register
    users.save(u);
    return res(u);
  }

  @PostMapping("/login")
  public AuthRes login(@Valid @RequestBody LoginReq r) {
    AppUser u = users.findByEmail(r.email().trim().toLowerCase()).orElse(null);
    if (u == null || !encoder.matches(r.password(), u.getPasswordHash()))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect");
    return res(u);
  }

  private AuthRes res(AppUser u) { return new AuthRes(jwt.generate(u.getEmail(), u.getRole().name()), u.getName(), u.getEmail(), u.getRole().name()); }
}
