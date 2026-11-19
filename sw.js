/* v1.87: Muay Thai Moe service worker — art is served from the device after the first visit.
   Images: cache first, refreshed in the background once per session so redrawn art still arrives.
   Game code and pages: network first, cache only when offline. */
const BUILD="38952b1d68",ART="mtm-art-v1",CODE="mtm-code";
const fresh=new Set();
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET")return;let u;try{u=new URL(q.url);}catch(x){return;}if(u.origin!==self.location.origin)return;
  if(/\/a\/[^?]+\.(webp|png|jpg|jpeg|gif)$/i.test(u.pathname)){
    e.respondWith(caches.open(ART).then(c=>c.match(q).then(hit=>{
      const net=()=>fetch(q).then(r=>{if(r&&r.ok)c.put(q,r.clone());return r;});
      if(hit){if(!fresh.has(u.pathname)){fresh.add(u.pathname);e.waitUntil(net().catch(()=>{}));}return hit;}
      fresh.add(u.pathname);return net();})));return;}
  e.respondWith(fetch(q).then(r=>{if(r&&r.ok){const cl=r.clone();caches.open(CODE).then(c=>c.put(q,cl));}return r;}).catch(()=>caches.open(CODE).then(c=>c.match(q,{ignoreSearch:true})).then(m=>m||Response.error())));});
