import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, EventItem, Seat, errorText } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { catColor } from '../core/util';
@Component({
  selector: 'vv-event-detail', standalone: true, imports: [DatePipe, CurrencyPipe, RouterLink],
  template: `
  <div class="page">
    <a routerLink="/events" class="muted back">Back to events</a>
    @if (event(); as e) {
      <header [style.background]="color(e.category)">
        <div><span class="chip">{{ e.category }}</span><h1>{{ e.title }}</h1>
          <p>{{ e.startTime | date:'EEEE, d MMMM y · h:mm a' }}</p><p>{{ e.venueName }}, {{ e.city }}</p></div>
        @if (auth.isStaff() && e.status === 'ACTIVE') { <button class="btn danger sm" (click)="cancel(e)">Cancel event</button> }
      </header>
      <p class="desc">{{ e.description }}</p>
      @if (e.status === 'CANCELLED') { <div class="alert">This event has been cancelled. Seat selling is closed.</div> }
      <div class="layout">
        <section class="panel chart">
          <div class="legend">
            @for (t of tiers; track t.k) { <span><i class="tier-dot" [attr.data-tier]="t.k"></i>{{ t.k.charAt(0) + t.k.slice(1).toLowerCase() }} {{ t.price | currency:'INR':'symbol':'1.0-0' }}</span> }
            <span><i class="sold-key"></i>Taken</span><span><i class="sel-key"></i>Your pick</span>
          </div>
          <div class="scroll">
            <div class="stage">STAGE</div>
            @for (r of rows(); track r.label) {
              <div class="srow"><span class="rl">{{ r.label }}</span>
                @for (s of r.seats; track s.id) {
                  <button class="seat" [attr.data-tier]="s.tier" [class.sold]="s.status==='SOLD'" [class.sel]="isSel(s)"
                    [class.aisle]="s.number === mid()" [disabled]="s.status==='SOLD' || e.status!=='ACTIVE'" (click)="toggle(s)"
                    [attr.aria-pressed]="isSel(s)" [attr.aria-label]="'Row ' + s.row + ' seat ' + s.number + ', ' + s.tier.toLowerCase() + ', ' + s.price + ' rupees' + (s.status==='SOLD' ? ', taken' : '')"></button>
                }
                <span class="rl">{{ r.label }}</span>
              </div>
            }
          </div>
        </section>
        <aside class="panel cart">
          <h2>Your seats</h2>
          @if (!selected().length) { <p class="muted">Select up to 8 seats on the map. Prices vary by tier.</p> }
          @else {
            <ul>@for (s of selected(); track s.id) { <li><span><i class="tier-dot" [attr.data-tier]="s.tier"></i>Row {{ s.row }}, seat {{ s.number }}</span><b>{{ s.price | currency:'INR':'symbol':'1.0-0' }}</b></li> }</ul>
            <div class="total"><span>Total</span><b>{{ total() | currency:'INR':'symbol':'1.0-0' }}</b></div>
          }
          @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
          <button class="btn block" [disabled]="!selected().length || busy() || e.status!=='ACTIVE'" (click)="checkout(e)">
            {{ busy() ? 'Booking…' : auth.user() ? 'Book ' + selected().length + ' seat' + (selected().length===1?'':'s') : 'Sign in to book' }}</button>
          <p class="hint">{{ e.totalSeats - e.soldSeats }} of {{ e.totalSeats }} seats still available.</p>
        </aside>
      </div>
    } @else if (error()) { <div class="alert">{{ error() }}</div> } @else { <div class="skeleton" style="height:240px"></div> }
  </div>`,
  styles: [`
    .back { display:inline-block; margin-bottom:12px; text-decoration:none; }
    header { color:#fff; border-radius:var(--r-lg); padding:32px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
    header h1 { margin:10px 0; } header p { opacity:.9; } header .chip { background:#ffffff2b; color:#fff; }
    header .btn.danger { color:#fff; box-shadow:inset 0 0 0 1.5px #fff; } .desc { margin:20px 0; max-width:70ch; }
    .layout { display:grid; grid-template-columns:1fr 330px; gap:22px; align-items:start; }
    .legend { display:flex; gap:18px; flex-wrap:wrap; font-size:13.5px; margin-bottom:18px; } .legend span { display:flex; align-items:center; }
    .sold-key,.sel-key { width:12px; height:12px; border-radius:3px; display:inline-block; margin-right:6px; }
    .sold-key { background:#CFD2E3; } .sel-key { background:var(--ink); }
    .scroll { overflow-x:auto; padding-bottom:8px; display:flex; flex-direction:column; align-items:center; min-width:0; }
    .stage { width:70%; min-width:260px; text-align:center; padding:8px; background:var(--ink); color:#fff; border-radius:4px 4px 50% 50% / 4px 4px 14px 14px; font:700 12.5px var(--head); letter-spacing:.2em; margin-bottom:26px; }
    .srow { display:flex; gap:5px; align-items:center; margin-bottom:5px; } .rl { width:20px; text-align:center; font-size:12px; color:var(--muted); font-weight:600; }
    .seat { width:24px; height:24px; border:0; border-radius:5px 5px 9px 9px; cursor:pointer; padding:0; transition:transform .1s; }
    .seat[data-tier=STANDARD] { background:var(--standard); } .seat[data-tier=PREMIUM] { background:var(--premium); } .seat[data-tier=VIP] { background:var(--vip); }
    .seat:hover:not(:disabled) { transform:scale(1.2); } .seat.aisle { margin-right:14px; }
    .seat.sold { background:#CFD2E3 !important; cursor:not-allowed; } .seat.sel { background:var(--ink) !important; box-shadow:0 0 0 2px #fff, 0 0 0 4px var(--ink); }
    .cart { position:sticky; top:20px; } .cart h2 { margin-bottom:12px; } .cart ul { list-style:none; padding:0; margin:0 0 12px; }
    .cart li { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--line); }
    .total { display:flex; justify-content:space-between; font:700 1.2rem var(--head); margin:12px 0 16px; } .cart .btn { margin-top:6px; } .cart .hint { margin-top:10px; }
    @media (max-width:980px) { .layout { grid-template-columns:1fr; } .cart { position:static; } }`]
})
export class EventDetailComponent implements OnInit {
  @Input() id!: string;
  private api = inject(ApiService); private router = inject(Router); auth = inject(AuthService);
  event = signal<EventItem | null>(null); seats = signal<Seat[]>([]); selected = signal<Seat[]>([]);
  error = signal(''); busy = signal(false); color = catColor;
  total = computed(() => this.selected().reduce((a, s) => a + s.price, 0));
  rows = computed(() => {
    const m = new Map<string, Seat[]>(); this.seats().forEach(s => (m.get(s.row) ?? m.set(s.row, []).get(s.row)!).push(s));
    return [...m].map(([label, seats]) => ({ label, seats }));
  });
  mid = computed(() => Math.floor((this.rows()[0]?.seats.length ?? 0) / 2));
  tiers = [{ k: 'STANDARD', price: 0 }, { k: 'PREMIUM', price: 0 }, { k: 'VIP', price: 0 }];
  ngOnInit() {
    this.api.event(+this.id).subscribe({ next: e => this.event.set(e), error: e => this.error.set(errorText(e, 'Event not found.')) });
    this.loadSeats();
  }
  private loadSeats() {
    this.api.seats(+this.id).subscribe(s => {
      this.seats.set(s);
      this.tiers = this.tiers.map(t => ({ ...t, price: s.find(x => x.tier === t.k)?.price ?? 0 }));
      const open = new Set(s.filter(x => x.status === 'AVAILABLE').map(x => x.id));
      this.selected.update(sel => sel.filter(x => open.has(x.id)));
    });
  }
  isSel(s: Seat) { return this.selected().some(x => x.id === s.id); }
  toggle(s: Seat) {
    this.error.set('');
    if (this.isSel(s)) return this.selected.update(l => l.filter(x => x.id !== s.id));
    if (this.selected().length >= 8) return this.error.set('You can book up to 8 seats at a time.');
    this.selected.update(l => [...l, s]);
  }
  checkout(e: EventItem) {
    if (!this.auth.user()) { this.router.navigate(['/login']); return; }
    this.busy.set(true); this.error.set('');
    this.api.placeOrder(e.id, this.selected().map(s => s.id)).subscribe({
      next: () => this.router.navigate(['/tickets']),
      error: err => { this.error.set(errorText(err)); this.busy.set(false); this.loadSeats(); }   // refresh so taken seats grey out
    });
  }
  cancel(e: EventItem) {
    if (confirm(`Cancel “${e.title}”? Buyers will no longer be able to book seats.`))
      this.api.cancelEvent(e.id).subscribe(() => this.ngOnInit());
  }
}
