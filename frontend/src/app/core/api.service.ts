import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
export const API = '/api';

export interface EventItem { id: number; title: string; category: string; description: string; startTime: string; venueId: number;
  venueName: string; city: string; basePrice: number; imageUrl?: string; status: string; totalSeats: number; soldSeats: number; }
export type Tier = 'STANDARD' | 'PREMIUM' | 'VIP';
export interface Seat { id: number; row: string; number: number; tier: Tier; price: number; status: 'AVAILABLE' | 'SOLD'; }
export interface Venue { id: number; name: string; city: string; address: string; rowsCount: number; seatsPerRow: number; capacity: number; }
export interface SeatLine { label: string; tier: Tier; price: number; }
export interface Order { id: number; code: string; eventId: number; eventTitle: string; startTime: string; venueName: string; city: string;
  total: number; createdAt: string; seats: SeatLine[]; }
export interface Summary {
  kpis: { revenue: number; ticketsSold: number; totalSeats: number; occupancy: number; events: number; avgOrder: number };
  topEvents: { title: string; revenue: number; sold: number; capacity: number }[];
  daily: { date: string; revenue: number; orders: number }[];
  soldByTier: Record<Tier, number>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  events(q = '', category = '') {
    let p = new HttpParams(); if (q) p = p.set('q', q); if (category) p = p.set('category', category);
    return this.http.get<EventItem[]>(`${API}/events`, { params: p });
  }
  event(id: number) { return this.http.get<EventItem>(`${API}/events/${id}`); }
  seats(id: number) { return this.http.get<Seat[]>(`${API}/events/${id}/seats`); }
  createEvent(b: unknown) { return this.http.post<EventItem>(`${API}/events`, b); }
  cancelEvent(id: number) { return this.http.delete<void>(`${API}/events/${id}`); }
  venues() { return this.http.get<Venue[]>(`${API}/venues`); }
  createVenue(b: unknown) { return this.http.post<Venue>(`${API}/venues`, b); }
  deleteVenue(id: number) { return this.http.delete<void>(`${API}/venues/${id}`); }
  placeOrder(eventId: number, seatIds: number[]) { return this.http.post<Order>(`${API}/orders`, { eventId, seatIds }); }
  myOrders() { return this.http.get<Order[]>(`${API}/orders/mine`); }
  summary() { return this.http.get<Summary>(`${API}/analytics/summary`); }
}
export function errorText(e: any, fallback = 'Something went wrong. Please try again.'): string {
  return e?.error?.message || (e?.status === 0 ? 'Can’t reach the server. Check that the API is running.' : fallback);
}
