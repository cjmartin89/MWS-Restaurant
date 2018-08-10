let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.srcset = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `${restaurant.name} Restaurant Picture`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  const pictureText = document.getElementById('restaurant-imageAltText');
  pictureText.innerHTML = image.alt;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewTitle();
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

// Add review title and button

fillReviewTitle = () => {
      const container = document.getElementById('reviews-container');
      const div = document.getElementById('div');
      const title = document.createElement('h2');
      const button = document. createElement('button');
      button. innerHTML = "Add Review";
      button.id = 'reviewBtn';
      title.innerHTML = 'Reviews';
      title.id = 'reviewTitle';
      container.appendChild(div);
      div.appendChild(title)
      div.appendChild(button);
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
  const reviewsUrl = DBHelper.REVIEWS_DATABASE_URL + `?restaurant_id=${self.restaurant.id}`;
  console.log(`Review URL: ${reviewsUrl}`);
  fetch(reviewsUrl).then(function(response) {
    response.json().then(function(data) {

      reviews = data;

      const container = document.getElementById('reviews-container');

      var modal = document.getElementById('reviewForm');
      var btn = document.getElementById('reviewBtn');

      // Review Form Modal

      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // Open the modal 
      btn.onclick = function() {
          modal.style.display = "block";
      }

      // Close the modal
      span.onclick = function() {
          modal.style.display = "none";
      }

      // When the user clicks anywhere outside of the modal, close it
      window.onclick = function(event) {
          if (event.target == modal) {
              modal.style.display = "none";
          }
      }

      if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
      }
      
      const ul = document.getElementById('reviews-list');
      reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
      });
      container.appendChild(ul);
    });
  })
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  console.log(review.name);
  li.appendChild(name);

  const date = document.createElement('p');
  var convertedDate = new Date(review.createdAt);
  console.log(`${convertedDate}`);
  date.innerHTML = convertedDate;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.addEventListener("load", function () {
  console.log(`Form Data: `)
  function sendData() {
    var XHR = new XMLHttpRequest();
    var restID = window.location.href.slice(-1);

    // Bind the FormData object and the form element
    var FD = new FormData(form);
    FD.append('restaurant_id', restID);
    console.log(FD);

    // Define what happens on successful data submission
    XHR.addEventListener("load", function(event) {
      alert(`You have successfully added your review`);
      document.getElementById("addReview").reset();
      var modal = document.getElementById('reviewForm');
      modal.style.display = "none";
      var ul = document.getElementById('reviews-list');
      var list = ul.getElementsByTagName("li")
      while(list.length > 0) {
        ul.removeChild(list[0]);
      }
      fillReviewsHTML();
    });

    // Define what happens in case of error
    XHR.addEventListener("error", function(event) {
      alert('Oops! Something went wrong.');
    });

    // Set up our request
    XHR.open("POST", "http://localhost:1337/reviews/");

    // The data sent is what the user provided in the form
    XHR.send(FD);

  }
 
  // Access the form element...
  this.console.log(`Get Form -----`);
  var form = document.getElementById("addReview");
  this.console.log(form);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log(`Submit Pressed`);

    sendData();
  });
});
