const CACHE="chronoloop-battle-app";
const CORE=["./","./index.html"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  if(u.pathname.endsWith("/version.json")){
    e.respondWith(fetch(e.request,{cache:"no-store"}));
    return;
  }
  if(e.request.mode==="navigate"){
    e.respondWith(caches.open(CACHE).then(async c=>{
      const hit=await c.match("./index.html")||await c.match("./");
      if(hit)return hit;
      try{
        const net=await fetch(e.request);
        if(net.ok){
          await c.put("./index.html",net.clone());
          await c.put("./",net.clone());
        }
        return net;
      }catch(_){
        return hit||Response.error();
      }
    }));
  }
});