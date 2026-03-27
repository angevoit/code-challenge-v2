import React, { useEffect, useState } from "react"

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet"

import "leaflet/dist/leaflet.css"

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson"

function YearSelect({ setFilterVal }) {
  // Filter by the permit issue year for each restaurant
  const startYear = 2026
  const years = [...Array(11).keys()].map((increment) => {
    return startYear - increment
  })
  const options = years.map((year) => {
    return (
      <option value={year} key={year}>
        {year}
      </option>
    )
  })

  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        onChange={(e) => setFilterVal(e.target.value)}
      >
        {options}
      </select>
    </>
  )
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"]

  const [currentYearData, setCurrentYearData] = useState([])
  const [year, setYear] = useState(2026)
  const [maxNumPermits, setMaxNumPermits] = useState(0)
  const [totalNumPermits, setTotalNumPermits] = useState(0)

  useEffect(() => {
    fetch(`/map-data/?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentYearData(data);
      });
  }, [year]);

  useEffect(() => {
    var current_maxNumPermits = 0
    var current_totalNumPermits = 0
    currentYearData.forEach(function (area, index) {
      if (area['num_permits'] > current_maxNumPermits) {
        current_maxNumPermits = area['num_permits'];
        console.log(area['name']);
      }
      current_totalNumPermits = current_totalNumPermits + 1;
    });
    setMaxNumPermits(current_maxNumPermits);
    setTotalNumPermits(current_totalNumPermits);
  }, [currentYearData]);

  function getColor(percentageOfPermits) {
    /**
     * TODO: Use this function in setAreaInteraction to set a community 
     * area's color using the communityAreaColors constant above
     */
    if (percentageOfPermits == 0) {
      return communityAreaColors[0];
    } else if (percentageOfPermits < 0.025) {
      return communityAreaColors[1];
    } else if (percentageOfPermits < 0.05) {
      return communityAreaColors[2];
    }
    else {
      return communityAreaColors[3];
    }
  }

  // Needs performance improvement (I would do the initial data processing differently)
  // TODO fix area loop (it's giving me a number rather than an object?)
  function findPermitCount(area_id) {
    var area = currentYearData.find((element) => element['area_id'].toString() == area_id)
    return area ? area['num_permits'] : -1;
  }

  function setAreaInteraction(feature, layer) {
    /**
     * TODO: Use the methods below to:
     * 1) Shade each community area according to what percentage of 
     * permits were issued there in the selected year
     * 2) On hover, display a popup with the community area's raw 
     * permit count for the year
     */
    var permit_count = findPermitCount(feature.properties.area_num_1)
    var percentageOfPermits = Boolean(totalNumPermits) ? permit_count / totalNumPermits : 0;
    layer.setStyle({fillColor: getColor(percentageOfPermits), strokeWeight: 5, fillOpacity: 0.6})
    layer.on("click", () => {
      if (feature.properties.community) {
        layer.bindPopup(`${feature.properties.community}: Permit count ${permit_count}`)
      }
      layer.openPopup()
    })
  }

  return (
    <>
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: {totalNumPermits}
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area: {maxNumPermits}
      </p>
      <MapContainer
        id="restaurant-map"
        center={[41.88, -87.62]}
        zoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={maxNumPermits}
          />
        ) : null}
      </MapContainer>
    </>
  )
}
