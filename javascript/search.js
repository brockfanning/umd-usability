// Load the JSON data and perform a search if necessary.
$.getJSON('/data/car-makes.json', function(data) {

  // Check the query parameters.
  var urlParams = new URLSearchParams(window.location.search);
  var filteredCountry = null;
  if (urlParams.has('country')) {
    filteredCountry = urlParams.get('country');
  }

  // Populate a dropdown.
  outputDropdown(data, filteredCountry);

  // Perform the search.
  if (urlParams.has('q')) {
    performSearch(urlParams.get('q'), data, filteredCountry);
  }

  // Attach AJAX functionality.
  attachAjaxFunctionality(data);
});

// Performs a search within an index of items.
var performSearch = function(search, index, filteredCountry) {
  $('#search-input').val(search);
  var results = [];
  var facets = {};
  search = search.toUpperCase();
  for (var i in index) {
    if (index[i].make_display.toUpperCase().includes(search)) {
      if (filteredCountry) {
        if (index[i].make_country != filteredCountry) {
          continue;
        }
      }
      results.push(index[i]);
      if (typeof facets[index[i].make_country] === 'undefined') {
        facets[index[i].make_country] = 1;
      }
      else {
        facets[index[i].make_country] += 1;
      }
    }
  }

  // Output the facets.
  //outputFacets(facets);

  var html = '';
  for (var i in results) {
    html += formatResult(results[i]);
  }
  if (html == '') {
    html = '<p>Sorry, no results were found.</p>';
  }
  else {
    html = '<ul>' + html + '</ul>';
  }
  $('#results').html(html);
}

// Formats a single result item.
var formatResult = function(item) {
  return '<li>' + item.make_display + '</li>';
}

var outputDropdown = function(data, filteredCountry) {

  var countries = {};
  for (var i in data) {
    countries[data[i].make_country] = data[i].make_country;
  }

  var label = '<label for="country-filter">Filter by country: </label>';
  var dropdown = '<select id="country-filter" name="country"><option value="">-- All countries --</option>';
  for (var country in countries) {
    var selected = '';
    if (country == filteredCountry) {
      selected = 'selected';
    }
    dropdown += '<option ' + selected + ' value="' + country + '">' + country + '</option>';
  }
  $('.search-form').prepend('<div>' + label + dropdown + '</div>');
}

// Outputs the facet items.
var outputFacets = function(facets) {
  var urlParams = new URLSearchParams(window.location.search);
  var link = '/search.html';
  var query = null;
  if (urlParams.has('q')) {
    link += '?q=' + urlParams.get('q') + '&';
  }
  else {
    link += '?';
  }

  var activeCountry = null;
  if (urlParams.has('country')) {
    activeCountry = urlParams.get('country');
  }

  var countries = Object.keys(facets).sort();

  var output = '';
  for (var i in countries) {
    var country = countries[i];
    if (activeCountry && activeCountry == country) {
      output += '<li><a href="' + link + '">- ' + country + ' (' + facets[country] + ')</a></li>';
    }
    else {
      output += '<li><a href="' + link + 'country=' + country + '">' + country + ' (' + facets[country] + ')</a></li>';
    }
  }
  $('#facets').html('<ul>' + output + '</ul>');
}

// Attach AJAX functionality.
var attachAjaxFunctionality = function(index) {
  $('.search-form input[type="submit"]').click(function(e) {

    var selectedCountry = $('#country-filter').val() || '';
    var keywords = $('#search-input').val() || '';

    performSearch(keywords, index, selectedCountry);

    e.preventDefault();
  });
}