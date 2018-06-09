// Code used on 6/5/18 https://developers.google.com/web/ilt/pwa/

(function() {
    'use strict';
  
    // Set files to cache
    var restaurantCacheFiles = [
      '/css/styles.css',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
      '/index.html',
      '/restaurant.html'
    ];
  
    // Cache name variable
    var restaurantCache = 'restaurant-cache-v1';
  
    //Install definition for the service worker
    self.addEventListener('install', function(event) {
      console.log('Attempting to install service worker and cache static assets');
      event.waitUntil(
        // Open restaurant cache
        caches.open(restaurantCache)
        .then(function(cache) {
          // Add static files to cache
          return cache.addAll(restaurantCacheFiles);
        })
      );
    });
  
    // Service Worker fetch event definition
    self.addEventListener('fetch', function(event) {
      console.log('Fetch event: ', event.request.url);
      event.respondWith(
        // Match request in the cache and return response if found
        caches.match(event.request).then(function(response) {
          if (response) {
            console.log('Found ', event.request.url, ' in cache');
            return response;
          }
          // Perform network request for the requested URL
          console.log('Network request for ', event.request.url);
          return fetch(event.request).then(function(response) {
            if (response.status === 404) {
              console.log('Unable to retrieve response')
            }
            // Open cache and place assets in cache
            return caches.open(restaurantCache).then(function(cache) {
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
          // Log any errors that result
        }).catch(function(error) {
          console.log('Error, ', error);
        })
      );
    });
  
  })();