import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Order, errorText } from '../core/api.service';
@Component({
  selector: 'vv-my-tickets', standalone: true, imports: [DatePipe, CurrencyPipe, RouterLink],
  template: `
  <div class="page">
    <div class="page-head"><div><h1>My tickets</h1><p class="muted">Show the booking code at the door.</p></div></div>
    @if (error()) { <div class="alert">{{ error() }}</div> }
    @if (!orders().length && !loading()) { <div class="empty"><h3>No tickets yet</h3><p>When you book seats they’ll appear here.</p><a class="btn" routerLink="/events" style="margin-top:14px">Find an event</a></div> }
    @for (o of orders(); track o.id) {
      <article class="ticket">
        <div class="main">
          <h2>{{ o.eventTitle }}</h2>
          <p>{{ o.startTime | date:'EEEE, d MMMM y · h:mm a' }}</p>
          <p class="muted">{{ o.venueName }}, {{ o.city }}</p>
          <div class="seats">@for (s of o.seats; track s.label) { <span class="seat-chip" [attr.data-tier]="s.tier">{{ s.label }}</span> }</div>
        </div>
        <div class="stub">
          <div class="code" aria-hidden="true">@for (b of bars(o.code); track $index) { <i [style.width.px]="b"></i> }</div>
          <b>{{ o.code }}</b>
          <span>{{ o.total | currency:'INR':'symbol':'1.0-0' }} · {{ o.seats.length }} seat{{ o.seats.length === 1 ? '' : 's' }}</span>
        </div>
      </article>
    }
  </div>`,
  styles: [`
    .ticket { display:grid; grid-template-columns:1fr 220px; background:#fff; border-radius:var(--r-md); margin-bottom:18px; border:1px solid var(--line); position:relative; }
    .main { padding:22px 26px; display:flex; flex-direction:column; gap:4px; } .main h2 { margin-bottom:6px; }
    .stub { border-left:2px dashed var(--line); padding:22px 18px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; text-align:center; font-size:13px; position:relative; }
    .stub::before,.stub::after { content:''; position:absolute; left:-11px; width:20px; height:20px; border-radius:50%; background:var(--paper); border:1px solid var(--line); }
    .stub::before { top:-11px; } .stub::after { bottom:-11px; } .stub b { font:700 1.05rem var(--head); letter-spacing:.06em; }
    .code { display:flex; gap:2px; height:44px; align-items:stretch; } .code i { background:var(--ink); display:block; } .code i:nth-child(even) { background:transparent; }
    .seats { display:flex; gap:6px; flex-wrap:wrap; margin-top:12px; }
    .seat-chip { padding:3px 11px; border-radius:6px; color:#fff; font-weight:600; font-size:13px; }
    .seat-chip[data-tier=STANDARD] { background:var(--standard); } .seat-chip[data-tier=PREMIUM] { background:var(--premium); } .seat-chip[data-tier=VIP] { background:var(--vip); }
    @media (max-width:640px) { .ticket { grid-template-columns:1fr; } .stub { border-left:0; border-top:2px dashed var(--line); } .stub::before { left:-11px; top:-11px; } .stub::after { left:auto; right:-11px; top:-11px; bottom:auto; } }`]
})
export class MyTicketsComponent implements OnInit {
  private api = inject(ApiService);
  orders = signal<Order[]>([]); loading = signal(true); error = signal('');
  ngOnInit() { this.api.myOrders().subscribe({ next: o => { this.orders.set(o); this.loading.set(false); }, error: e => { this.error.set(errorText(e)); this.loading.set(false); } }); }
  bars(code: string) { return Array.from(code.replace('-', '')).flatMap(c => [1 + (c.charCodeAt(0) % 3), 1 + (c.charCodeAt(0) % 2)]); }
}
