var crimePoints = [];
var ecv = [];
var map;
var directionsDisplay;
var directionsService;
var heatmap;
var filteredPoints;

function initMap() {
  for (var i = 0; i < crimeJson.length; i++) {
    var temp = crimeJson[i]["location_1"]["coordinates"];
    crimePoints[i] = new google.maps.LatLng(temp[1], temp[0]);
  }
  filteredPoints = crimePoints;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsService = new google.maps.DirectionsService;
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {lat: 34.0472, lng: -118.3370}
  });
  directionsDisplay.setMap(map);

  directionsDisplay.setPanel(document.getElementById('right-panel'));
  var control2 = document.getElementById('floating-panel2');
  control2.style.display = 'block';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control2);
  var control = document.getElementById('floating-panel');
  control.style.display = 'block';
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(control);

  heatmap = new google.maps.visualization.HeatmapLayer({
    data: crimePoints,
  });

  heatmap.setMap(map);
  heatmap.set('radius', heatmap.get('radius') ? null : 25);

  google.maps.event.addListener(directionsDisplay, 'routeindex_changed', function() {
    document.getElementById('ecv').value = ecv[directionsDisplay.getRouteIndex()];
  });

  document.getElementById('mode').addEventListener('change', function() {
    if (document.getElementById('start').value && document.getElementById('end')) {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    }
  });
  document.getElementById('start').addEventListener('change', function() {
    if (document.getElementById('end').value) {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    }
  });
  document.getElementById('end').addEventListener('change', function() {
    if (document.getElementById('start').value) {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    }
    document.getElementById('right-panel').style.opacity = 1;
  });
  document.getElementById('Time of Travel').addEventListener('change', function() {
    filterData();
    var routes = directionsDisplay.getDirections().routes;
    for (var i = 0; i < routes.length; i++) {
      updateECV(routes[i].legs[0], i);
    }
    document.getElementById('ecv').value = ecv[directionsDisplay.getRouteIndex()];
  });
  document.getElementById('genderlist').addEventListener('change', function() {
    filterData();
    var routes = directionsDisplay.getDirections().routes;
    for (var i = 0; i < routes.length; i++) {
      updateECV(routes[i].legs[0], i);
    }
    document.getElementById('ecv').value = ecv[directionsDisplay.getRouteIndex()];
  });
}

function filterData() {
  filteredPoints = []; //array to hold new points
  var theTime = document.getElementById("Time of Travel").value;
  var gender = document.getElementById("genderlist").value;
  var counter = 0; //gender selected in dropdown
  for (var i = 0; i < crimeJson.length; i++){
    var time = crimeJson[i]["time_occ"];
    var temp = crimeJson[i]["location_1"]["coordinates"];
    var crime_gen = crimeJson[i]["vict_sex"];
    if (theTime == "2400") {
      if (gender === "0"){
        filteredPoints[counter] = new google.maps.LatLng(temp[1], temp[0]);
        counter += 1;
      } else if (crime_gen === gender) {
        filteredPoints[counter] = new google.maps.LatLng(temp[1], temp[0]);
        counter += 1;
      }
    }
    else if ((Math.floor(theTime/100)) == (Math.floor(time/100)) && gender === "0"){
      filteredPoints[counter] = new google.maps.LatLng(temp[1], temp[0]);
      counter += 1;
    }
    else if((Math.floor(theTime/100)) == (Math.floor(time/100)) && crime_gen === gender) {
      filteredPoints[counter] = new google.maps.LatLng(temp[1], temp[0]);
      counter += 1;
    }
  }
  heatmap.setData(filteredPoints);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var selectedMode = document.getElementById('mode').value;
  console.log("listener initiated. selected mode " + selectedMode);
  if (document.getElementById('start').value && document.getElementById('end').value) {
    console.log("start: " + document.getElementById('start').value + ", end: " + document.getElementById('end').value)
  }
  directionsService.route({
    origin: document.getElementById('start').value,
    destination: document.getElementById('end').value,
    // Note that Javascript allows us to access the constant
    // using square brackets and a string value as its
    // "property."
    travelMode: google.maps.TravelMode[selectedMode],
    provideRouteAlternatives: true
  }, function(response, status) {
    if (status == 'OK') {
      console.log("directions status ok");
      for (var i = 0; i < response.routes.length; i++) {
        var myRoute = response.routes[i].legs[0];
        updateECV(myRoute, i);
      }
      directionsDisplay.setDirections(response);
      console.log("changed");
    } else {
      console.log('Directions request failed due to ' + status);
    }
  });
}

function updateECV(route, index) {
  var crimeCounter = 0;
  var totalCounter = 0;
  for (var j = 0; j < route.steps.length; j++) {
      for (var k = 0; k < route.steps[j].path.length; k++) {
        for (var l = 0; l < filteredPoints.length; l++) {
         if (Math.abs(route.steps[j].path[k].lat() - filteredPoints[l].lat()) <= 0.0001 && Math.abs(route.steps[j].path[k].lng() - filteredPoints[l].lng()) <= 0.0001) {
           crimeCounter += 1;
         }
        }
        totalCounter += 1;
      }
  }
  ecv[index] = crimeCounter / totalCounter;
}
