package com.venuevista.repo;
import com.venuevista.model.BookingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<BookingOrder, Long> {
  List<BookingOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}
