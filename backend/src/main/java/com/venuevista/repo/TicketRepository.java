package com.venuevista.repo;
import com.venuevista.model.Ticket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface TicketRepository extends JpaRepository<Ticket, Long> {
  List<Ticket> findByEventIdOrderByRowLabelAscSeatNumberAsc(Long eventId);
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select t from Ticket t where t.id in :ids")
  List<Ticket> lockAll(@Param("ids") List<Long> ids);
  @Query("select t.event.id, t.status, count(t) from Ticket t group by t.event.id, t.status")
  List<Object[]> countsByEvent();
  @Query("select t from Ticket t join fetch t.event where t.status = :s")
  List<Ticket> withStatus(@Param("s") Ticket.Status s);
}
