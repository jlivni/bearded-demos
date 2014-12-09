/**
 * @fileoverview Places API autocomplete ez-add widget
 * usage:  var autocomplete = new Autocomplete(map, [input], [control]);
 *
 * If no element is provided for the input, a new one will be appended
 * with id 'PLACES_AUTOCOMPLETE_'
 *
 * defaults have been run, including the setCenter() and setZoom() methods.
 *
 * @author jlivni@google.com (Josh Livni).
 */

/**
 * @constructor
 * @param {google.maps.Map} map the Map associated with this Autocomplete.
 * @param {Node} [element] for the input
 * @param {String} [position] for the control (e.g. 'TOP_RIGHT';)
 */
function Autocomplete(map, element, position) {

  var DEFAULT_ZOOM_ = 17; // In case now bounding box found for the geometry.
  var DEFAULT_DIV_ID_ = 'PLACES_AUTOCOMPLETE_';
  var DEFAULT_CONTROL_POSITION_ = 'TOP_LEFT';


  // check to see if we have a places div
  var input = document.getElementById(element);
  if (!element) {
    var input = document.createElement('input');
    input.id = DEFAULT_DIV_ID_;
    input.size = 50;
    input.style.padding = '5px'
    input.style.marginTop = '25px'
    map.getDiv().appendChild(input);
  }

  // make it a control
  var position = position || DEFAULT_CONTROL_POSITION_;
  map.controls[google.maps.ControlPosition[position]].push(input);
  

  // and bind it to the map
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  autocomplete.addListener('place_changed', function(place) {
    var place = autocomplete.getPlace();
    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(this.DEFAULT_ZOOM_);
    }
  });
  return autocomplete
}

