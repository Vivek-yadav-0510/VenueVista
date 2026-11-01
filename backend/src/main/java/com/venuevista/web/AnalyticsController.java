package com.venuevista.web;
import com.venuevista.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/analytics") @RequiredArgsConstructor
public class AnalyticsController {
  private final AnalyticsService svc;
  @GetMapping("/summary") public AnalyticsService.Summary summary() { return svc.summary(); }
}
