// public-shared.js
// Shared helpers for the public-facing pages (index, menu, locations,
// reserve, about). Centralizes the Firestore reads for locations, team
// roles, and site-wide settings so each page doesn't duplicate the same
// fetch + sort logic. Import only what a given page needs.

import { db } from './firebase-init.js';
import {
  collection, getDocs, doc, getDoc, query, where, orderBy, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function sortByOrder(list){
  return list.sort(function(a, b){ return (a.order || 0) - (b.order || 0); });
}

export async function fetchLocations(){
  try{
    const snap = await getDocs(collection(db, 'locations'));
    const list = snap.docs.map(function(d){ const l = d.data(); l.id = d.id; return l; });
    return sortByOrder(list);
  }catch(e){
    console.error('Could not load locations:', e);
    return [];
  }
}

export async function fetchTeam(){
  try{
    const snap = await getDocs(collection(db, 'team'));
    const list = snap.docs.map(function(d){ const t = d.data(); t.id = d.id; return t; });
    return sortByOrder(list);
  }catch(e){
    console.error('Could not load team:', e);
    return [];
  }
}

export async function fetchSettings(){
  try{
    const snap = await getDoc(doc(db, 'settings', 'site'));
    return snap.exists() ? snap.data() : {};
  }catch(e){
    console.error('Could not load settings:', e);
    return {};
  }
}

// Builds a Google Maps search URL from a location's address if no explicit
// mapsLink has been set in the admin panel yet — keeps the "Directions"
// button working even for branches nobody has filled that field in for.
export function mapsUrlFor(loc){
  if(loc.mapsLink) return loc.mapsLink;
  const q = 'Rubels and Angels ' + loc.address + ' ' + (loc.cityLine || '');
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
}

export async function fetchApprovedReviews(){
  try{
    const q = query(collection(db, 'reviews'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(function(d){
      const r = d.data();
      return { name: r.name, meta: 'Verified guest', text: r.text, rating: r.rating, photoUrl: r.photoUrl || null };
    });
  }catch(e){
    console.error('Could not load reviews:', e);
    return [];
  }
}

// Every review goes in as "pending" so it shows up in the admin Reviews tab
// for approval before it appears on any public page's carousel.
export async function submitReview(payload){
  return addDoc(collection(db, 'reviews'), Object.assign({}, payload, {
    status: 'pending',
    createdAt: serverTimestamp()
  }));
}

export function escapeHTML(s){
  return String(s || '').replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

export function starString(n){
  const rounded = Math.round(Number(n) || 0);
  let s = '';
  for(let i = 0; i < 5; i++){ s += i < rounded ? '\u2605' : '\u2606'; }
  return s;
}

// Applies site-wide settings (general WhatsApp number, social links) to the
// chrome that's duplicated across every page: the floating WhatsApp button,
// the footer's "WhatsApp us" link, and any "Chat on WhatsApp" CTA. Matched
// by text/class rather than by href, so it never touches per-branch WhatsApp
// links rendered elsewhere on the page.
export function applyGlobalChrome(settings){
  if(settings.whatsapp){
    const wa = settings.whatsapp;
    const floatBtn = document.querySelector('a.wa-float');
    if(floatBtn) floatBtn.setAttribute('href', 'https://wa.me/' + wa);
    document.querySelectorAll('a').forEach(function(a){
      const t = a.textContent.trim();
      if(t === 'WhatsApp us' || t === 'Chat on WhatsApp'){
        a.setAttribute('href', 'https://wa.me/' + wa);
      }
    });
  }
  if(settings.instagramUrl){
    const ig = document.querySelector('a[aria-label="Instagram"]');
    if(ig) ig.setAttribute('href', settings.instagramUrl);
  }
  if(settings.facebookUrl){
    const fb = document.querySelector('a[aria-label="Facebook"]');
    if(fb) fb.setAttribute('href', settings.facebookUrl);
  }
}
