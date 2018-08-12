const port = '1337'

let restaurants,
    neighborhoods,
    cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;

      

      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  var favStatus = false;
  restaurants.forEach(restaurant => {
    favStatus = restaurant.is_favorite;
    ul.append(createRestaurantHTML(restaurant, favStatus));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  var favStatus = restaurant.is_favorite;
  const li = document.createElement('li');
  id = getRestId(restaurant);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.srcset = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `${restaurant.name} Restaurant Picture`;
  li.append(image);

  const pictureText = document.createElement('p');
  pictureText.className = 'imageAltText';
  pictureText.innerHTML = image.alt;
  li.append(pictureText);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const button = document.createElement('button')
  const more = document.createElement('a');
  button.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.appendChild(button);
  li.append(more);

  const favButton = document.createElement('btn');
  const favImage = document.createElement('img');
  favButton.id = `favButton-${id}`;
  favButton.type = 'submit';
  favButton.append(favImage);
  li.append(favButton);

  setImage = () => {
    if(favStatus == 'true') {
      return favImage.src = 'img/icons/filled-star.png';
      } else {
        return favImage.src = 'img/icons/empty-star.png';
      }
  }

  setImage();

  // const favoriteText = document.createElement('p');
  // favoriteText.className = 'imageAltText';
  // favoriteText.innerHTML = favStatus;
  // li.append(favoriteText);

  // Load Event Listener

  window.addEventListener("load", () => {
    toggleFavorite(restaurant, favStatus);
  })

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

//Implement Favorite Feature

toggleFavorite = (restaurant, favStatus) => {
  var restId = getRestId(restaurant);
  const favButton = document.getElementById(`favButton-${restId}`);
  var status = favStatus
  favButton.onclick = function(){
    console.log(`Restaurant ID: ${restaurant.id}`);
    console.log(`Fav Status: ${status}`);
    if(status == 'true') {
      favButton.childNodes[0].src = '';
      favButton.childNodes[0].src = 'img/icons/empty-star.png';
      favoriteDB('false', restaurant);
      status = 'false';
      console.log(`New Status: ${status}`);
      console.log(`Restaurant Unfavorited`);
    } else {
      favButton.childNodes[0].src = '';
      favButton.childNodes[0].src = 'img/icons/filled-star.png';
      favoriteDB('true', restaurant);
      status = 'true';
      console.log(`New Status: ${status}`);
      console.log(`Restaurant Favorited`);
    }
  }
}

getRestId = (restaurant) => {
  var url = DBHelper.urlForRestaurant(restaurant);
  var restId = url.substring(url.indexOf('=')+1);
  return restId;
}

favoriteDB = (isFavorite, restaurant) => {
  var restId = getRestId(restaurant);
  var url = `http://localhost:1337/restaurants/${restId}/?is_favorite=${isFavorite}`;
  var data = {is_favorite: `${isFavorite}`};

  fetch(url, {
    method: 'PUT',
    body: null,
    headers:{
      'Content-Type': 'application/json'
    }
  }).then(res => res.json())
  .catch(error => console.error('Error:', error))
  .then(response => console.log('Success:', response, console.log(url)));
}