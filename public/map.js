// holds the statistics for this map
var STATISTICS = {
  all: {'phrase': "All"},
  regular: {'phrase': "Eating & Drinking"},
  regular_takeout: {'phrase': "Eating & Drinking w/ Take Out"},
  only_takeout: {'pharse': "Mobile Food Walk On"},
  retail: {'phrase': "Retail Food"}
};
Object.keys(STATISTICS).forEach(function(key){
  STATISTICS[key].maxScore = Number.MIN_SAFE_INTEGER;
  STATISTICS[key].minScore = Number.MAX_SAFE_INTEGER;
  STATISTICS[key].totalScore = 0;
  STATISTICS[key].count = 0;
});
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: {lat: 42.3601, lng: -71.0589}
  });

  // Load the geojson and then categorize them and give them values
  map.data.loadGeoJson('FoodViolationData.geojson', null, function(features){
    features.forEach(function(feature) {
      var score = feature.getProperty("Positivity") - feature.getProperty("Severity");
      feature.setProperty("Score",  score);
      STATISTICS.all.minScore = score < STATISTICS.all.minScore ? score : STATISTICS.all.minScore;
      STATISTICS.all.maxScore = score > STATISTICS.all.maxScore ? score : STATISTICS.all.maxScore;
      STATISTICS.all.totalScore += score;
      STATISTICS.all.count += 1;
      if (feature.getProperty('DESCRIPT') == STATISTICS.regular_takeout.phrase) {
        feature.setProperty("Category", "regular_takeout");
        STATISTICS.regular_takeout.minScore = score < STATISTICS.regular_takeout.minScore ? score : STATISTICS.regular_takeout.minScore;
        STATISTICS.regular_takeout.maxScore = score > STATISTICS.regular_takeout.maxScore ? score : STATISTICS.regular_takeout.maxScore;
        STATISTICS.regular_takeout.totalScore += score;
        STATISTICS.regular_takeout.count += 1;
      } else if (feature.getProperty('DESCRIPT') == STATISTICS.only_takeout.phrase) {
        feature.setProperty("Category", "only_takeout");
        STATISTICS.only_takeout.minScore = score < STATISTICS.only_takeout.minScore ? score : STATISTICS.only_takeout.minScore;
        STATISTICS.only_takeout.maxScore = score > STATISTICS.only_takeout.maxScore ? score : STATISTICS.only_takeout.maxScore;
        STATISTICS.only_takeout.totalScore += score;
        STATISTICS.only_takeout.count += 1;
      } else if (feature.getProperty('DESCRIPT') == STATISTICS.retail.phrase) {
        feature.setProperty("Category", "retail");
        STATISTICS.retail.minScore = score < STATISTICS.retail.minScore ? score : STATISTICS.retail.minScore;
        STATISTICS.retail.maxScore = score > STATISTICS.retail.maxScore ? score : STATISTICS.retail.maxScore;
        STATISTICS.retail.totalScore += score;
        STATISTICS.retail.count += 1;
      } else {
        feature.setProperty("Category", "regular");
        STATISTICS.regular.minScore = score < STATISTICS.regular.minScore ? score : STATISTICS.regular.minScore;
        STATISTICS.regular.maxScore = score > STATISTICS.regular.maxScore ? score : STATISTICS.regular.maxScore;
        STATISTICS.regular.totalScore += score;
        STATISTICS.regular.count += 1;
      }
    });
    // Calculate averages and remove categories that had nothing in them
    Object.keys(STATISTICS).forEach(function(key){
      if (STATISTICS[key].count == 0) {
        delete STATISTICS[key];
      } else {
        STATISTICS[key].average = Math.round(STATISTICS[key].totalScore / STATISTICS[key].count);
      }
    });

    // Show Stats table at the bottom of html
    showStatsTable(STATISTICS);
    map.data.setStyle(function(feature) {
      var score = feature.getProperty('Score');
      var category = feature.getProperty("Category");
      var categoryHigh = STATISTICS[category].maxScore;
      var categoryLow = STATISTICS[category].minScore;
      var categoryAverage = STATISTICS[category].average;
      var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
      return {
        icon: icon_text
      };
    });
  });
  var infowindow = new google.maps.InfoWindow({
    content: 'defaultcontentstring'
  });

  // add infowindow to the map
  map.data.addListener('click', function(event) {
    infowindow.setContent(getInfoWindowContent(event.feature));
    infowindow.setPosition(event.feature.getGeometry().get());
    infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
    infowindow.open(map);
  });

  // Add controls to the map, allowing users to hide/show features.
  var styleControl = document.getElementById('style-selector-control');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(styleControl);

  // Apply new JSON when the user chooses to hide/show features.
  document.getElementById('show-all').addEventListener('click', function() {
    map.data.setStyle(showAllStyle);
  });
  document.getElementById('show-all-categorical').addEventListener('click', function() {
    map.data.setStyle(showAllCategoricalStyle);
  });
  document.getElementById('show-regular').addEventListener('click', function() {
    map.data.setStyle(showRegularStyle);
  });
  document.getElementById('show-regular-takeout').addEventListener('click', function() {
    map.data.setStyle(showRegularTakeoutStyle);
  });
  document.getElementById('show-retail').addEventListener('click', function() {
    map.data.setStyle(showRetailStyle);
  });
  document.getElementById('show-only-takeout').addEventListener('click', function() {
    map.data.setStyle(showOnlyTakoutStyle);
  });
}

/**
  * Returns appropriate information window content for a given geojson feature
  * In this case it is an HTML Table
  * @param  {[type]} feature [description]
  * @return {[type]}         [description]
  */
function getInfoWindowContent(feature) {
  var contentString = "<h3>" + feature.getProperty("businessName") + "</h3>";
  contentString += "<table>";
  var dontShowKeys = new Set(["businessName", "Severity", "Positivity", "Category"]);
  feature.forEachProperty(function(val, key) {
    if (!dontShowKeys.has(key)){
      contentString += "<tr>";
      contentString += "<td>" + key + "</td>";
      contentString += "<td>" + val + "</td>"
      contentString += "</tr>";
    }
  });
  contentString += '</table>'
  return contentString;
}

/**
  * Appends a statistics table at the bottom of the HTML
  * @param  {JSON} stats [description]
  */
function showStatsTable(stats) {
  var table = document.getElementById('stats');
  var topRow = document.createElement('tr')
  table.appendChild(topRow)
  topRow.appendChild(document.createElement('td')).appendChild(document.createTextNode('Category'))
  topRow.appendChild(document.createElement('td')).appendChild(document.createTextNode('Amount'))
  topRow.appendChild(document.createElement('td')).appendChild(document.createTextNode('Average Score'))
  topRow.appendChild(document.createElement('td')).appendChild(document.createTextNode('Lowest Score'))
  topRow.appendChild(document.createElement('td')).appendChild(document.createTextNode('Highest Score'))
  Object.keys(stats).forEach(function(key, index) {
    var row = document.createElement('tr');
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(stats[key].phrase));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(stats[key].count));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(stats[key].average));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(stats[key].minScore));
    row.appendChild(document.createElement('td')).appendChild(document.createTextNode(stats[key].maxScore));
    table.appendChild(row);
  });
}

/**
  * Gets the category as compared to the score's category high's and low's
  * can be r1, r2, r3, r4 if bad or g1, g2, g3, g4 if good
  * @param  {[int]} score        [description]
  * @param  {[int]} average     [description]
  * @param  {[int]} categoryLow  [description]
  * @param  {[int]} categoryHigh [description]
  * @return {[String]}              [description]
  */
function getCategory(score, average, categoryLow, categoryHigh) {
  score -= average;
  categoryLow -= average;
  categoryHigh -= average;
  if (score == 0) {
    return 'g1';
  } else if (score > 0) {
    return 'g' +  Math.ceil(4 * (score / categoryHigh))
  } else {
    return 'r' +  Math.ceil(4 * (score / categoryLow));
  }
}


/**
  * Function for when all types of points are visible and weighted as a whole
  * @param  {[type]} feature [description]
  * @return {[type]}         [description]
  */
var showAllStyle = function(feature) {
  if (!(STATISTICS.hasOwnProperty('all'))) {
    return {visible: false};
  }
  var score = feature.getProperty('Score');
  var category = feature.getProperty("Category");
  var categoryHigh = STATISTICS['all'].maxScore;
  var categoryLow = STATISTICS['all'].minScore;
  var categoryAverage = STATISTICS['all'].average;
  var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
  return {
    icon: icon_text
  };
}
/**
  * Function for when all types of points are visible and categorically weighted
  * @param  {[type]} feature [description]
  * @return {[type]}         [description]
  */
var showAllCategoricalStyle = function(feature) {
  var score = feature.getProperty('Score');
  var category = feature.getProperty("Category");
  var categoryHigh = STATISTICS[category].maxScore;
  var categoryLow = STATISTICS[category].minScore;
  var categoryAverage = STATISTICS[category].average;
  var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
  return {
    icon: icon_text
  };
}

/**
  * Style function for when only regular types of points are visible
  * @param  {[Feature]} feature [description]
  * @return {[type]}         [description]
  */
var showRegularStyle =  function(feature) {
  if (!(STATISTICS.hasOwnProperty('regular'))) {
    return {visible: false};
  }
  var score = feature.getProperty('Score');
  var category = feature.getProperty("Category");
  var categoryHigh = STATISTICS['regular'].maxScore;
  var categoryLow = STATISTICS['regular'].minScore;
  var categoryAverage = STATISTICS['regular'].average;
  var shouldBeSeen = category == 'regular';
  var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
  return {
    icon: icon_text,
    visible: shouldBeSeen
  };
}

/**
  * Style function for when only regular_takeout types of points are visible
  * @param  {[Feature]} feature [description]
  * @return {[type]}         [description]
  */
var showRegularTakeoutStyle =  function(feature) {
  if (!(STATISTICS.hasOwnProperty('regular_takeout'))) {
    return {visible: false};
  }
  var score = feature.getProperty('Score');
  var category = feature.getProperty("Category");
  var categoryHigh = STATISTICS['regular_takeout'].maxScore;
  var categoryLow = STATISTICS['regular_takeout'].minScore;
  var categoryAverage = STATISTICS['regular_takeout'].average;
  var shouldBeSeen = category == 'regular_takeout';
  var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
  return {
    icon: icon_text,
    visible: shouldBeSeen
  };
}

/**
  * Style function for when only retail types of points are visible
  * @param  {[Feature]} feature [description]
  * @return {[type]}         [description]
  */
var showRetailStyle =  function(feature) {
  if (!(STATISTICS.hasOwnProperty('retail'))) {
    return {visible: false};
  }
  var score = feature.getProperty('Score');
  var category = feature.getProperty("Category");
  var categoryHigh = STATISTICS['retail'].maxScore;
  var categoryLow = STATISTICS['retail'].minScore;
  var categoryAverage = STATISTICS['retail'].average;
  var shouldBeSeen = category == 'retail';
  var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
  return {
    icon: icon_text,
    visible: shouldBeSeen
  };
}
/**
  * Style function for when only only_takeout types of points are visible
  * @param  {[Feature]} feature [description]
  * @return {[type]}         [description]
  */
var showOnlyTakoutStyle =  function(feature) {
  if (!(STATISTICS.hasOwnProperty('only_takeout'))) {
    return {visible: false};
  }
  var score = feature.getProperty('Score');
  var category = feature.getProperty("Category");
  var categoryHigh = STATISTICS['only_takeout'].maxScore;
  var categoryLow = STATISTICS['only_takeout'].minScore;
  var categoryAverage = STATISTICS['only_takeout'].average;
  var shouldBeSeen = category == 'retail';
  var icon_text = 'icons/regular_'+ getCategory(score, categoryAverage, categoryLow, categoryHigh) +'.png';
  return {
    icon: icon_text,
    visible: shouldBeSeen
  };
}