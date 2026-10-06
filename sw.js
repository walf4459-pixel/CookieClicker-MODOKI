// オフライン対応: 一度開いたら、ファイルを端末に保存して、ネットなしでも起動できるようにする。
// ゲームを更新したときは、下の VERSION の数字を1つ上げてから公開する（古い保存が入れ替わる）。
var VERSION = 'v1';
var CACHE = 'cookie-clicker-' + VERSION;
var FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// 保存してあるものをまず出し、ネットにつながっているときは裏で新しいものに更新する
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(function(hit){
      var net = fetch(e.request).then(function(res){
        if(res && res.ok && new URL(e.request.url).origin === location.origin){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});
