import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, Venue, errorText } from '../core/api.service';
@Component({
  selector: 'vv-venues', standalone: true, imports: [FormsModule],
  template: `
  <div class="page">
    <div class="page-head"><div><h1>Venues &amp; seating</h1><p class="muted">Design the seating chart once, reuse it for every event.</p></div></div>
    <div class="layout">
      <form class="panel" (ngSubmit)="add()" #f="ngForm">
        <h2>Add a venue</h2>
        @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
        <div class="field"><label for="n">Venue name</label><input id="n" name="n" [(ngModel)]="m.name" required></div>
        <div class="field"><label for="c">City</label><input id="c" name="c" [(ngModel)]="m.city" required></div>
        <div class="field"><label for="a">Address</label><input id="a" name="a" [(ngModel)]="m.address"></div>
        <div class="two">
          <div class="field"><label for="r">Rows (A–Z)</label><input id="r" name="r" type="number" min="1" max="26" [(ngModel)]="m.rowsCount" required></div>
          <div class="field"><label for="s">Seats per row</label><input id="s" name="s" type="number" min="1" max="40" [(ngModel)]="m.seatsPerRow" required></div>
        </div>
        <div class="preview" aria-label="Seating preview"><div class="st">STAGE</div>
          @for (r of preview(); track $index) { <div class="pr">@for (s of seatsArr(); track $index) { <i [attr.data-t]="tierOf($index, r)"></i> }</div> }
        </div>
        <p class="hint">{{ (m.rowsCount||0) * (m.seatsPerRow||0) }} seats. Front 20% of rows are VIP, next 40% Premium.</p>
        <button class="btn block" [disabled]="f.invalid || busy()">Save venue</button>
      </form>
      <section>
        @if (!venues().length) { <div class="empty"><h3>No venues yet</h3><p>Add your first venue to start creating events.</p></div> }
        @for (v of venues(); track v.id) {
          <article class="panel venue">
            <div><h3>{{ v.name }}</h3><p class="muted">{{ v.address }}{{ v.address ? ', ' : '' }}{{ v.city }}</p>
              <p><b>{{ v.capacity }}</b> seats · {{ v.rowsCount }} rows × {{ v.seatsPerRow }}</p></div>
            <button class="btn danger sm" (click)="remove(v)">Remove</button>
          </article>
        }
      </section>
    </div>
  </div>`,
  styles: [`
    .layout { display:grid; grid-template-columns:380px 1fr; gap:24px; align-items:start; } .two { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    form h2 { margin-bottom:14px; } .venue { display:flex; justify-content:space-between; gap:12px; margin-bottom:14px; }
    .preview { background:var(--paper); border-radius:var(--r-sm); padding:12px; margin-bottom:8px; overflow:auto; display:flex; flex-direction:column; align-items:center; gap:3px; }
    .st { background:var(--ink); color:#fff; font:700 10px var(--head); letter-spacing:.2em; padding:3px 30px; border-radius:3px; margin-bottom:6px; }
    .pr { display:flex; gap:3px; } .pr i { width:8px; height:8px; border-radius:2px 2px 4px 4px; display:block; }
    i[data-t=V] { background:var(--vip); } i[data-t=P] { background:var(--premium); } i[data-t=S] { background:var(--standard); }
    @media (max-width:900px) { .layout { grid-template-columns:1fr; } }`]
})
export class VenuesComponent implements OnInit {
  private api = inject(ApiService);
  venues = signal<Venue[]>([]); error = signal(''); busy = signal(false);
  m: any = { name: '', city: '', address: '', rowsCount: 10, seatsPerRow: 16 };
  ngOnInit() { this.load(); }
  load() { this.api.venues().subscribe(v => this.venues.set(v)); }
  preview() { return Array.from({ length: Math.min(Math.max(+this.m.rowsCount || 0, 0), 26) }, (_, i) => i); }
  seatsArr() { return Array.from({ length: Math.min(Math.max(+this.m.seatsPerRow || 0, 0), 40) }); }
  tierOf(_: number, row: number) { const n = +this.m.rowsCount; return row < Math.ceil(n * .2) ? 'V' : row < Math.ceil(n * .6) ? 'P' : 'S'; }
  add() {
    this.busy.set(true); this.error.set('');
    this.api.createVenue(this.m).subscribe({
      next: () => { this.busy.set(false); this.m = { name: '', city: '', address: '', rowsCount: 10, seatsPerRow: 16 }; this.load(); },
      error: e => { this.error.set(errorText(e)); this.busy.set(false); }
    });
  }
  remove(v: Venue) {
    if (!confirm(`Remove ${v.name}?`)) return;
    this.api.deleteVenue(v.id).subscribe({ next: () => this.load(), error: e => this.error.set(errorText(e)) });
  }
}
