import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ApiService, Summary, errorText } from '../core/api.service';
@Component({
  selector: 'vv-dashboard', standalone: true, imports: [CurrencyPipe, DatePipe, DecimalPipe],
  template: `
  <div class="page">
    <div class="page-head"><div><h1>Sales analytics</h1><p class="muted">Revenue, seat fill and tier mix across all events.</p></div></div>
    @if (error()) { <div class="alert">{{ error() }}</div> }
    @if (data(); as d) {
      <div class="kpis">
        <div class="kpi main"><span>Total revenue</span><b>{{ d.kpis.revenue | currency:'INR':'symbol':'1.0-0' }}</b><small>from {{ d.kpis.ticketsSold | number }} tickets</small></div>
        <div class="kpi"><span>Seat fill</span><b>{{ d.kpis.occupancy }}%</b><small>{{ d.kpis.ticketsSold | number }} of {{ d.kpis.totalSeats | number }} seats</small></div>
        <div class="kpi"><span>Average order</span><b>{{ d.kpis.avgOrder | currency:'INR':'symbol':'1.0-0' }}</b><small>across all bookings</small></div>
        <div class="kpi"><span>Events</span><b>{{ d.kpis.events }}</b><small>listed</small></div>
      </div>
      <div class="cols">
        <section class="panel">
          <h2>Revenue, last 14 days</h2>
          <svg viewBox="0 0 600 190" role="img" aria-label="Daily revenue line chart" preserveAspectRatio="none">
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4122F" stop-opacity=".25"/><stop offset="1" stop-color="#C4122F" stop-opacity="0"/></linearGradient></defs>
            <path [attr.d]="area()" fill="url(#g)"/><path [attr.d]="line()" fill="none" stroke="#C4122F" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
          </svg>
          <div class="axis"><span>{{ d.daily[0].date | date:'d MMM' }}</span><span>Peak {{ peak() | currency:'INR':'symbol':'1.0-0' }}</span><span>{{ d.daily[d.daily.length-1].date | date:'d MMM' }}</span></div>
        </section>
        <section class="panel">
          <h2>Tickets by tier</h2>
          <div class="donut-wrap"><div class="donut" [style.background]="donut()" role="img" aria-label="Share of tickets sold by tier"><span>{{ d.kpis.ticketsSold | number }}</span></div>
            <ul>@for (t of tierList(); track t.k) { <li><i class="tier-dot" [attr.data-tier]="t.k"></i>{{ t.k.charAt(0) + t.k.slice(1).toLowerCase() }} <b>{{ t.n | number }}</b></li> }</ul></div>
        </section>
      </div>
      <section class="panel">
        <h2>Top events by revenue</h2>
        @if (!d.topEvents.length) { <p class="muted">No sales yet.</p> }
        @for (e of d.topEvents; track e.title) {
          <div class="ev"><div class="top"><span>{{ e.title }}</span><b>{{ e.revenue | currency:'INR':'symbol':'1.0-0' }}</b></div>
            <div class="bar"><i [style.width.%]="e.revenue * 100 / d.topEvents[0].revenue"></i></div>
            <small class="muted">{{ e.sold }} / {{ e.capacity }} seats sold ({{ e.capacity ? (e.sold * 100 / e.capacity | number:'1.0-0') : 0 }}%)</small></div>
        }
      </section>
    } @else if (!error()) { <div class="skeleton" style="height:320px"></div> }
  </div>`,
  styles: [`
    .kpis { display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:16px; margin-bottom:22px; }
    .kpi { background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:18px; display:flex; flex-direction:column; gap:2px; }
    .kpi span { color:var(--muted); font-weight:500; } .kpi b { font:800 1.9rem var(--head); } .kpi small { color:var(--muted); }
    .kpi.main { background:var(--ink); color:#fff; border:0; } .kpi.main span,.kpi.main small { color:#B9BBDD; } .kpi.main b { font-size:2.4rem; }
    .cols { display:grid; grid-template-columns:1.7fr 1fr; gap:16px; margin-bottom:16px; } h2 { margin-bottom:14px; }
    svg { width:100%; height:190px; display:block; } .axis { display:flex; justify-content:space-between; font-size:12.5px; color:var(--muted); margin-top:6px; }
    .donut-wrap { display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
    .donut { width:140px; height:140px; border-radius:50%; display:grid; place-items:center; position:relative; }
    .donut::after { content:''; position:absolute; inset:24px; background:#fff; border-radius:50%; } .donut span { position:relative; z-index:1; font:800 1.3rem var(--head); }
    ul { list-style:none; margin:0; padding:0; display:grid; gap:8px; } li b { margin-left:6px; }
    .ev { margin-bottom:16px; } .top { display:flex; justify-content:space-between; margin-bottom:6px; } .bar { height:10px; background:#E4E7F3; border-radius:6px; overflow:hidden; margin-bottom:4px; }
    .bar i { display:block; height:100%; background:var(--ink-3); border-radius:6px; }
    @media (max-width:900px) { .kpis { grid-template-columns:1fr 1fr; } .cols { grid-template-columns:1fr; } }`]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  data = signal<Summary | null>(null); error = signal('');
  private pts = computed(() => {
    const d = this.data()?.daily ?? []; const max = Math.max(...d.map(x => x.revenue), 1);
    return d.map((x, i) => [i * (600 / Math.max(d.length - 1, 1)), 180 - (x.revenue / max) * 160]);
  });
  line = computed(() => this.pts().map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '));
  area = computed(() => this.line() + ' L600 190 L0 190 Z');
  peak = computed(() => Math.max(...(this.data()?.daily ?? []).map(x => x.revenue), 0));
  tierList = computed(() => Object.entries(this.data()?.soldByTier ?? {}).map(([k, n]) => ({ k, n })));
  donut = computed(() => {
    const t = this.data()?.soldByTier; if (!t) return '';
    const sum = (t.STANDARD + t.PREMIUM + t.VIP) || 1; const a = t.STANDARD * 100 / sum; const b = a + t.PREMIUM * 100 / sum;
    return `conic-gradient(#5F6FD8 0 ${a}%, #B8862B ${a}% ${b}%, #C4122F ${b}% 100%)`;
  });
  ngOnInit() { this.api.summary().subscribe({ next: d => this.data.set(d), error: e => this.error.set(errorText(e)) }); }
}
