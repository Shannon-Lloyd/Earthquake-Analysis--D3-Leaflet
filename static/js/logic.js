// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";


// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
  
  
});

//Set colors per depth of earthquake
function getColor(d) {
  return  d < 10 ? '#b7ffa1' :
          d < 30  ? '#f9fcc2' :
          d < 50  ? '#fae48c' :
          d < 70  ? '#fcbf6a' :
          d < 90  ? '#faa25f' :
                    '#f75a45';
};


function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  //Added a link to the date to provide the url for info about the earthquake
  //Added Depth and Magnitude
  function onEachFeature(feature, layer) {
    

    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr>
      <p>Date: <a href="${feature.properties.url}">${new Date(feature.properties.time)}</a></p>
      <p>Depth: ${feature.geometry.coordinates[2]}</p>
      <p>Magnitude: ${feature.properties.mag}</p>`);
      
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  //This was hard to find for onEachFeature and pointToLayer https://leafletjs.com/examples/geojson/
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
    var geojsonMarkerOptions = {
      radius: 8,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6,
      radius: (feature.properties.mag)*2.5

  };
      return L.circleMarker(latlng, geojsonMarkerOptions);
  }
  });
  

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
  
}


function createMap(earthquakes) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 // *****************Add The Legend!!!
 var legend = L.control({position: 'bottomright'});

 legend.onAdd = function (map) {
 
     var div = L.DomUtil.create('div', 'info legend'),
         depths = [-10, 10, 30, 50, 70, 90],
         labels = [];
 
     // loop through our density intervals and generate a label with a colored square for each interval
     for (var i = 0; i < depths.length-1; i++) {
         div.innerHTML +=
         `<i style= "background-color:${getColor(depths[i] + 1)};"></i>${depths[i]} &ndash; ${depths[i + 1]}<br>`
     }

     div.innerHTML += `<i style="background:${getColor(depths[depths.length - 1])};"></i>${depths[depths.length - 1]}+`
 
     return div;
 };
 
 legend.addTo(myMap);


}

