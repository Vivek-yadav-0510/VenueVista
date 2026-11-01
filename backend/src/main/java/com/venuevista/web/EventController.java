package com.venuevista.web;
import com.venuevista.service.EventService;
import com.venuevista.service.EventService.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/events") @RequiredArgsConstructor
public class EventController {
  private final EventService svc;
  @GetMapping public List<EventDto> list(@RequestParam(required = false) String q, @RequestParam(required = false) String category) { return svc.list(q, category); }
  @GetMapping("/{id}") public EventDto get(@PathVariable Long id) { return svc.get(id); }
  @GetMapping("/{id}/seats") public List<SeatDto> seats(@PathVariable Long id) { return svc.seats(id); }
  @PostMapping public EventDto create(@RequestBody EventReq r) { return svc.create(r); }
  @DeleteMapping("/{id}") public void cancel(@PathVariable Long id) { svc.cancel(id); }
}
