import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, Venue, errorText } from '../core/api.service';
import { CATEGORIES } from '../core/util';
@Component({
  selector: 'vv-event-form', standalone: true, imports: [FormsModule, RouterLink, CurrencyPipe],
  template: `
  <div class="page narrow">
    <div class="page-head"><div><h1>Create event</h1><p class="muted">Seats are generated from the venue’s seating chart and priced by tier.</p></div></div>
    @if (!venues().length) { <div class="alert">You need a venue first. <a routerLink="/venues">Add a venue</a></div> }
    <form class="panel" (ngSubmit)="save()" #f="ngForm">
      @if (error()) { <div class="alert" role="alert">{{ error() }}</div> }
      <div class="field"><label for="t">Event title</label><input id="t" name="title" [(ngModel)]="m.title" required></div>
      <div class="two">
        <div class="field"><label for="c">Category</label><select id="c" name="category" [(ngModel)]="m.category">@for (c of cats; track c) { <option [value]="c">{{ c }}</option> }</select></div>
        <div class="field"><label for="d">Date and start time</label><input id="d" name="start" type="datetime-local" [(ngModel)]="m.startTime" required></div>
      </div>
      <div class="two">
        <div class="field"><label for="v">Venue</label><select id="v" name="venue" [(ngModel)]="m.venueId" required>
          <option [ngValue]="null" disabled>Choose a venue</option>
          @for (v of venues(); track v.id) { <option [ngValue]="v.id">{{ v.name }} ({{ v.capacity }} seats)</option> }</select></div>
        <div class="field"><label for="p">Standard ticket price (₹)</label><input id="p" name="price" type="number" min="0" [(ngModel)]="m.basePrice" required>
          <span class="hint">Premium is 1.5× and VIP is 2× this price.</span></div>
      </div>
      <div class="field"><label for="ds">Description</label><textarea id="ds" name="desc" rows="4" [(ngModel)]="m.description"></textarea></div>
      @if (m.basePrice) { <p class="hint prices">Standard {{ m.basePrice | currency:'INR':'symbol':'1.0-0' }} · Premium {{ m.basePrice*1.5 | currency:'INR':'symbol':'1.0-0' }} · VIP {{ m.basePrice*2 | currency:'INR':'symbol':'1.0-0' }}</p> }
      <button class="btn" [disabled]="f.invalid || busy()">{{ busy() ? 'Publishing…' : 'Publish event' }}</button>
    </form>
  </div>`,
  styles: [`.narrow { max-width:760px; } .two { display:grid; grid-template-columns:1fr 1fr; gap:16px; } .prices { margin-bottom:16px; } @media (max-width:640px){ .two{grid-template-columns:1fr;} }`]
})
export class EventFormComponent implements OnInit {
  private api = inject(ApiService); private router = inject(Router);
  venues = signal<Venue[]>([]); error = signal(''); busy = signal(false); cats = CATEGORIES;
  m: any = { title: '', category: 'Concert', startTime: '', venueId: null, basePrice: null, description: '' };
  ngOnInit() { this.api.venues().subscribe(v => this.venues.set(v)); }
  save() {
    this.busy.set(true); this.error.set('');
    this.api.createEvent(this.m).subscribe({
      next: e => this.router.navigate(['/events', e.id]),
      error: e => { this.error.set(errorText(e)); this.busy.set(false); }
    });
  }
}
