import idb from "idb";
import "babel-polyfill";

const obStore = 'restaurants';

var dbPromise = idb.open("mws-restaurant", 1, upgradeDB => {
    console.log(`Creating Object Store`);
    upgradeDB.createObjectStore(obStore, {keyPath: 'id'});
  });

  dbPromise.then(async db => {
    console.log(`Begin adding objects to store`);
      if(!restaurants || restaurants.length === 0) {
        const response = await fetch('http://localhost:1337/restaurants');
        restaurants = await response.json();
        console.log(`Adding Restaurants to IDB`);
        restaurants.forEach(
          restaurant => db.transaction(obStore, 'readwrite')
          .objectStore(obStore)
          .put(restaurant)
        );
      }
      return restaurants;
    }
  )

  dbPromise.then(db => {
    if(db) {
      var tx =  db.transaction(obStore, 'readonly');
      tx.objectStore(obStore)
      .getAll;
    }

    return [];
  })

