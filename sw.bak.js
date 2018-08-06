// Code used on 6/5/18 https://developers.google.com/web/ilt/pwa/

//Code used on 6/8/18 https://developers.google.com/web/fundamentals/primers/service-workers/

const cacheID = "mws-restaurant";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheID).then(cache => {
    return cache
      .addAll([
      "/",
      "/index.html",
      "/restaurant.html",
      "/css/styles.css",
      "/js/dbhelper.js",
      "/js/main.js",
      "/js/restaurant_info.js",
      "/js/register.js",
      "sw.js",
      "/js/bundledidb.js",

    ])
      .catch(error => {
        console.log("Failed to open cache: " + error);
      });
  }));
});

self.addEventListener('activate', function (event) {

});

self.addEventListener('fetch', function (event) {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.pathname === '/') {
    event.respondWith(caches.match('index.html'));
    return;
  }

  if (event.request.url.startsWith('http://localhost:1337')) {
      // avoid caching the API calls as those will be handle by IDB
      return;
  }

  console.log(`Fetch event: ', ${requestUrl}`);
  event.respondWith(
    // Match request in the cache and return response if found
    caches.match(event.request).then(function(response) {
      if (response) {
        console.log('Found ', requestUrl, ' in cache');
        return response;
      }
      // Perform network request for the requested URL
      console.log('Network request for ', requestUrl);
      return fetch(event.request).then(function(response) {
        if (response.status === 404) {
          console.log('Unable to retrieve response')
        }
        // Open cache and place assets in cache
        return caches.open(cacheID).then(function(cache) {
          cache.put(requestUrl, response.clone());
          return response;
        });
      });
      // Log any errors that result
    }).catch(function(error) {
      console.log('Error, ', error);
    })
  );

});
