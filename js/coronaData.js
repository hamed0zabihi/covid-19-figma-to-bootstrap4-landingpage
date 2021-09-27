// use async function for get data from free api
async function mapEffect({ map } = {}) {
  let response;
  try {
    response = await axios.get("https://corona.lmao.ninja/v2/countries");
  } catch (e) {
    console.log(`Failed to fetch countries: ${e.message}`, e);
    return;
  }
  //end try catch
  const { data = [] } = response;
  console.log("🚀 ~ file: coronaData.js ~ line 12 ~ mapEffect ~ data", data);
  // check data isEsist or not
  const hasData = Array.isArray(data) && data.length > 0;
  if (!hasData) return;

  const geoJson = {
    type: "FeatureCollection",
    features: data.map((country = {}) => {
      const { countryInfo = {} } = country;
      const { lat, long: lng } = countryInfo;
      return {
        type: "Feature",
        properties: {
          ...country,
        },
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
      };
    }),
  };
  return geoJson;
}
//function for create layot in leaflet map
// its run when async function complete
function cronaDataForMap(map, geoJson) {
  const geoJsonLayers = new L.geoJSON(geoJson, {
    pointToLayer: (feature = {}, latlng) => {
      const { properties = {} } = feature;
      let updatedFormatted;
      let casesString;

      const { country, updated, cases, deaths, recovered } = properties;

      casesString = `${cases}`;

      if (cases > 1000) {
        casesString = `${casesString.slice(0, -3)}k+`;
      }

      if (updated) {
        updatedFormatted = new Date(updated).toLocaleString();
      }

      const html = `
              <span class="icon-marker">
                <span class="icon-marker-tooltip">
                  <h2>${country}</h2>
                  <ul>
                    <li><strong>Confirmed:</strong> ${cases}</li>
                    <li><strong>Deaths:</strong> ${deaths}</li>
                    <li><strong>Recovered:</strong> ${recovered}</li>
                    <li><strong>Last Update:</strong> ${updatedFormatted}</li>
                  </ul>
                </span>
                ${casesString}
              </span>
            `;
      return L.marker(latlng, {
        icon: L.divIcon({
          className: "icon",
          html,
        }),
        riseOnHover: true,
      });
    }, //geojasonlayers
  }); //cronadatas
  return geoJsonLayers.addTo(map);
} //end function-adds layer to leaflet

// function for datatable
//its run when async function complete
function cronaDataForTable(v) {
  const propertiess = { ...v.features };
  // if you want Choose a specific number of countries ,use  .take(10)  in lodash
  const FilteredData = _(propertiess)
    .orderBy((item) => item.properties.deaths, "desc")
    .value();

  console.log(
    "🚀 ~ file: coronaData.js ~ line 90 ~ cronaDataForTable ~ FilteredData",
    FilteredData
  );

  // generate table row
  const dataRowGenerate = FilteredData.map(
    (el) =>
      `<tr>
        <td><img src="${el.properties.countryInfo.flag}" width="32px" class="img-fluid">  ${el.properties.country}</td>
         <td>${el.properties.deaths}</td>
         <td>${el.properties.todayDeaths}</td>
       </tr>`
  );
  const dataRowJoin = dataRowGenerate.join("");

  // gererate data table
  const tableData =
    `
    <h2>live report</h2>
    <table id="datatableid" class="table table-bordered table-sm" width="100%">
      <thead>
        <tr>
          <th>country</th>
          <th>deasths</th>
          <th>today deaths</th>
        </tr>
      </thead>
      <tbody>
` +
    dataRowJoin +
    `
      </tbody>
    </table>
  `;
  document.getElementById("tableformap").innerHTML = tableData;
}

// options for data table
// change  perpage row and other
function tabladataoptions() {
  $("#datatableid").DataTable({
    pagingType: "simple", // "simple" option for 'Previous' and 'Next' buttons only
    order: [[1, "desc"]],
    searching: false,
    info: false,
    bLengthChange: false,
    pageLength: 6,
    language: {
      paginate: {
        next: '<i class="fa fa-fw fa-chevron-right">',
        previous: '<i class="fa fa-fw fa-chevron-left">',
      },
    },
    // dom: "plrti",
  });
  $(".dataTables_length").addClass("bs-select");
}

//run async function and other functions should be run after async function
mapEffect(map).then((data) => {
  cronaDataForMap(map, data);
  cronaDataForTable(data);
  tabladataoptions();
});
