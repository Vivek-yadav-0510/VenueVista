package com.venuevista.web;
import com.venuevista.service.OrderService;
import com.venuevista.service.OrderService.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/orders") @RequiredArgsConstructor
public class OrderController {
  private final OrderService svc;
  @PostMapping public OrderDto place(Authentication a, @RequestBody OrderReq r) { return svc.place(a.getName(), r); }
  @GetMapping("/mine") public List<OrderDto> mine(Authentication a) { return svc.mine(a.getName()); }
}
