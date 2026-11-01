package com.venuevista.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;
@Component
public class JwtUtil {
  private final SecretKey key;
  private final long expMs;
  public JwtUtil(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
    this.expMs = expMs;
  }
  public String generate(String email, String role) {
    return Jwts.builder().subject(email).claim("role", role).issuedAt(new Date())
      .expiration(new Date(System.currentTimeMillis() + expMs)).signWith(key).compact();
  }
  public Claims parse(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
