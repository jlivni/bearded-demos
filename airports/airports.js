var map;
var airports = {};
var currentMarker;
var infowindow = new google.maps.InfoWindow();

function initialize() {
  var mapOptions = {
    zoom: 4,
    center: new google.maps.LatLng(35, -110),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  infowindow.setMap(map);
  $.getJSON('predict.json', loadAirports);
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push($('#panel')[0]);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push($('#dropdown')[0]);
}

function loadAirports(json) {
  $.each(json, function(seasonId, results) {
    $.each(results, function(j, row) {
      if (!airports[row[0]]) {
        var latLng = new google.maps.LatLng(row[1], row[2]);
        var marker = new google.maps.Marker({
          position: latLng,
          map: map,
          icon: getIcon(1)
        });
        marker.correlations = {};
        marker.title = row[0];

        google.maps.event.addListener(marker, 'click', function() {
          currentMarker = marker;
          highlightCorrelations();
        });

        google.maps.event.addListener(marker, 'mouseover', function() {
          infowindow.setContent(marker.title);
          infowindow.open(map, marker);
        });
        google.maps.event.addListener(marker, 'mouseout', function() {
          infowindow.close();
        });
        google.maps.event.addListener(map, 'zoom_changed', function() {
          highlightCorrelations();
        });
        airports[row[0]] = marker;
      }
      // for all seasons, add correlations
      airports[row[0]].correlations[seasonId] = row[3];
    });
  });
  highlightCorrelations();
}


function highlightCorrelations() {
  // first make all the airports go small
  var seasonId = parseInt($('#season').val());
  $.each(airports, function(id, marker) {
    if (marker.correlations[seasonId]) {
      marker.setIcon(getIcon(2, 'black'));
    } else {
      marker.setIcon(getIcon(1, 'grey'));
    }
  });
  if (!currentMarker) {
    return;
  }
  $('#panel').html('');
  $.each(currentMarker.correlations[seasonId], function(i, correlation) {
    var marker = airports[correlation[0]];
    marker.setIcon(getIcon(correlation[1] * 15, 'red'));
    if (i < 5) {
      var html = '<div class="result">';
      html += '<span class="key">' + correlation[0] + '</span>';
      html += '<span class="value">' + correlation[1].toFixed(3) + '</span>';
      html += '</div>';
      $('#panel').append(html);
      }
  });
  var icon = currentMarker.getIcon();
  icon.strokeColor = 'blue';
  icon.strokeWeight = 3;
  currentMarker.setIcon(icon);
}

function getIcon(scale, color, path) {
  return {
    path: path || google.maps.SymbolPath.CIRCLE,
    fillColor: color || 'black',
    fillOpacity: .6,
    scale: scale * Math.pow(1.4, Math.max(2, (map.getZoom() - 2))),
    strokeColor: 'white',
    strokeWeight: .5
  };
}
