import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, EventItem, errorText } from '../core/api.service';
import { CATEGORIES, catColor } from '../core/util';
@Component({
  selector: 'vv-events', standalone: true, imports: [FormsModule, RouterLink, DatePipe, CurrencyPipe],
  template: `
  <div class="page">
    <div class="page-head"><div><h1>What’s on</h1><p class="muted">Pick an event, then pick your exact seats.</p></div>
      <div class="row"><input class="search" type="search" placeholder="Search by event, venue or city" aria-label="Search events" [(ngModel)]="q" (ngModelChange)="load()"></div></div>
    <div class="cats" role="group" aria-label="Filter by category">
      <button [class.on]="!cat" (click)="setCat('')">All</button>
      @for (c of cats; track c) { <button [class.on]="cat===c" (click)="setCat(c)">{{ c }}</button> }
    </div>
    @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
    @if (loading()) { <div class="grid">@for (i of [1,2,3]; track i) { <div class="skeleton" style="height:300px"></div> }</div> }
    @else if (!events().length) { <div class="empty"><h3>No events match that search</h3><p>Try a different keyword or clear the category filter.</p></div> }
    @else {
      <div class="grid">
        @for (e of events(); track e.id) {
          <a class="card" [routerLink]="['/events', e.id]">
            <div class="poster" [style.background]="color(e.category)">
              <div class="date"><b>{{ e.startTime | date:'d' }}</b><span>{{ e.startTime | date:'MMM' }}</span></div>
              <span class="cat">{{ e.category }}</span>
            </div>
            <div class="body">
              <h3>{{ e.title }}</h3>
              <p class="muted">{{ e.venueName }}, {{ e.city }}</p>
              <p class="muted">{{ e.startTime | date:'EEE, h:mm a' }}</p>
              <div class="foot">
                <span>From <b>{{ e.basePrice | currency:'INR':'symbol':'1.0-0' }}</b></span>
                @if (e.status === 'CANCELLED') { <span class="chip cancelled">Cancelled</span> }
                @else if (e.soldSeats >= e.totalSeats) { <span class="chip cancelled">Sold out</span> }
                @else { <span class="left" [class.low]="pct(e) > 80">{{ e.totalSeats - e.soldSeats }} seats left</span> }
              </div>
              <div class="bar" aria-hidden="true"><i [style.width.%]="pct(e)"></i></div>
            </div>
          </a>
        }
      </div>
    }
  </div>`,
  styles: [`
    .search { padding:10px 14px; border:1.5px solid var(--line); border-radius:99px; width:300px; max-width:100%; background:#fff; }
    .cats { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:24px; }
    .cats button { border:1.5px solid var(--line); background:#fff; border-radius:99px; padding:6px 16px; cursor:pointer; font-weight:500; }
    .cats button.on { background:var(--ink); color:#fff; border-color:var(--ink); }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:22px; }
    .card { background:#fff; border-radius:var(--r-md); overflow:hidden; text-decoration:none; border:1px solid var(--line); display:flex; flex-direction:column; transition:box-shadow .2s; }
    .card:hover { box-shadow:0 10px 28px #15132B22; }
    .poster { height:120px; position:relative; color:#fff; padding:14px; }
    .poster::after { content:''; position:absolute; left:0; right:0; bottom:-7px; height:14px; background:radial-gradient(circle at 7px 0, var(--paper) 6px, transparent 7px) 0 0/22px 14px repeat-x; }
    .date { display:inline-flex; flex-direction:column; align-items:center; background:#ffffff26; border-radius:var(--r-sm); padding:6px 12px; line-height:1; }
    .date b { font:800 1.7rem var(--head); } .date span { font-size:12.5px; margin-top:3px; }
    .cat { position:absolute; right:14px; top:14px; font-weight:600; font-size:13px; }
    .body { padding:20px 18px 16px; display:flex; flex-direction:column; gap:3px; flex:1; } .body h3 { margin-bottom:4px; }
    .foot { display:flex; justify-content:space-between; align-items:center; margin-top:12px; }
    .left { font-size:13px; color:var(--ok); font-weight:600; } .left.low { color:var(--crimson); }
    .bar { height:4px; background:#E4E7F3; border-radius:4px; margin-top:8px; overflow:hidden; } .bar i { display:block; height:100%; background:var(--ink-3); }`]
})
export class EventsComponent implements OnInit {
  private api = inject(ApiService);
  events = signal<EventItem[]>([]); loading = signal(true); error = signal('');
  q = ''; cat = ''; cats = CATEGORIES; color = catColor; private t?: any;
  ngOnInit() { this.fetch(); }
  load() { clearTimeout(this.t); this.t = setTimeout(() => this.fetch(), 250); }
  setCat(c: string) { this.cat = c; this.fetch(); }
  pct(e: EventItem) { return e.totalSeats ? Math.round(e.soldSeats * 100 / e.totalSeats) : 0; }
  private fetch() {
    this.loading.set(true);
    this.api.events(this.q, this.cat).subscribe({
      next: r => { this.events.set(r); this.loading.set(false); this.error.set(''); },
      error: e => { this.error.set(errorText(e)); this.loading.set(false); }
    });
  }
}
