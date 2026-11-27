/* v1.87: Muay Thai Moe service worker — art is served from the device after the first visit.
   Images: cache first. v1.91.28: once per session each image is re-checked with its ETag (a few bytes, 304 when unchanged) instead of being downloaded again, so redrawn art still arrives without eating the player's bandwidth.
   Game code and pages: network first, cache only when offline. */
const BUILD="cf26077c98",ART="mtm-art-v1",CODE="mtm-code";
const fresh=new Set();
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET")return;let u;try{u=new URL(q.url);}catch(x){return;}if(u.origin!==self.location.origin)return;
  if(/\/a\/[^?]+\.(webp|png|jpg|jpeg|gif)$/i.test(u.pathname)){
    e.respondWith(caches.open(ART).then(c=>c.match(q).then(hit=>{
      const net=()=>fetch(q).then(r=>{if(r&&r.ok)c.put(q,r.clone());return r;});
      const check=h=>{const et=h.headers.get("ETag"),lm=h.headers.get("Last-Modified");if(!et&&!lm)return Promise.resolve();const hd={};if(et)hd["If-None-Match"]=et;if(lm)hd["If-Modified-Since"]=lm;
        return fetch(u.href,{headers:hd,cache:"no-store"}).then(r=>{if(r&&r.status===200)return c.put(q,r);});};
      if(hit){if(!fresh.has(u.pathname)){fresh.add(u.pathname);e.waitUntil(check(hit).catch(()=>{}));}return hit;}
      fresh.add(u.pathname);return net();})));return;}
  e.respondWith(fetch(q).then(r=>{if(r&&r.ok){const cl=r.clone();caches.open(CODE).then(c=>c.put(q,cl));}return r;}).catch(()=>caches.open(CODE).then(c=>c.match(q,{ignoreSearch:true})).then(m=>m||Response.error())));});
