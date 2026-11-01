package com.venuevista.security;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;
@Configuration @RequiredArgsConstructor
public class SecurityConfig {
  private final JwtFilter jwtFilter;
  @Value("${app.cors-origin}") private String corsOrigin;

  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults()).csrf(c -> c.disable())
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .exceptionHandling(e -> e.authenticationEntryPoint((rq, rs, ex) -> rs.sendError(401, "Please sign in")))
      .authorizeHttpRequests(a -> a
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/events/**", "/api/venues/**").permitAll()
        .requestMatchers("/api/analytics/**").hasAnyRole("ADMIN", "ORGANIZER")
        .requestMatchers("/api/events/**", "/api/venues/**").hasAnyRole("ADMIN", "ORGANIZER")
        .anyRequest().authenticated())
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  @Bean CorsConfigurationSource corsSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of(corsOrigin));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
  }
}
