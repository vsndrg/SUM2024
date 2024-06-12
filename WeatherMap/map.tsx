import React, { useState, useEffect, useRef } from 'react';
import Map, {
  Source,
  Layer,
  Popup
} from './node_modules/react-map-gl/dist/es5/exports-maplibre';
// import type { CircleLayer } from './node_modules/react-map-gl/dist/es5/exports-maplibre';
import type { FeatureCollection } from 'geojson';
import MapImage from './MapImage';
// import { displayWeather } from './weather';

export function App() {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const spbCoords = {
    lng: 30.3158,
    lat: 59.9398
  };
  const [weatherDesc, setWeatherDesc] = useState({
    temp: 0,
    desc: 'rain',
    feels_like: 0,
    wind_speed: 0,
    country: 'RU',
    name: 'Spb'
  });
  const [popupVisible, setPopupVisible] = useState(false);

  interface PopupInfo {
    longitude: number;
    latitude: number;
    name: string;
    country: string;
    temp: number;
    feels_like: number;
    desc: string;
    wind_speed: number;
  }

  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  let [clickCoords, setClickCoords] = useState({
    lng: spbCoords.lng,
    lat: spbCoords.lat
  });

  function displayWeather(props: { lng: number; lat: number }) {
    const key = '5c0d23c03f9a1f44ad6eb154cbc736bf';
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${props.lat}&lon=${props.lng}&units=metric&appid=${key}`;

    fetch(url).then((data) => {
      data.text().then((txt) => {
        const obj = JSON.parse(txt);

        setWeatherDesc({
          temp: obj.main.temp,
          desc: obj.weather[0].description,
          feels_like: obj.main.feels_like,
          wind_speed: obj.wind.speed,
          country: obj.sys.country,
          name: obj.name
        });
        // setPopupVisible(true);
        console.log(weatherDesc);
      });
    });

    console.log(weatherDesc.temp);
  }

  function onMapClick(event: any) {
    // if (mapWrapperRef.current && popupVisible) {
    //   const mapWrapperRect = mapWrapperRef.current.getBoundingClientRect();

    //   const offsetX = event.point.x + mapWrapperRect.left; //  - windowWidthOffset / 2;
    //   const offsetY = event.point.y + mapWrapperRect.top; //  - windowHeightOffset / 2;
    //   setClickCoords({ x: offsetX, y: offsetY });
    //   displayWeather({ lng: event.lngLat.lng, lat: event.lngLat.lat });
    //   console.log(`x: ${event.point.x}\ny: ${event.point.y}`);
    // }
    const { lngLat } = event;
    setClickCoords({ lng: lngLat.lng, lat: lngLat.lat });
    displayWeather({ lng: lngLat.lng, lat: lngLat.lat });
    // const popupInfoData: PopupInfo = {
    //   longitude: lngLat.lng,
    //   latitude: lngLat.lat,
    //   name: weatherDesc.name,
    //   country: weatherDesc.country,
    //   temp: weatherDesc.temp,
    //   feels_like: weatherDesc.feels_like,
    //   desc: weatherDesc.desc,
    //   wind_speed: weatherDesc.wind_speed
    // };
    // setPopupInfo(popupInfoData);
  }

  useEffect(() => {
    console.log('popup info:', popupInfo);
  }, [popupInfo]);

  useEffect(() => {
    if (clickCoords) {
      setPopupInfo({
        longitude: clickCoords.lng,
        latitude: clickCoords.lat,
        name: weatherDesc.name,
        country: weatherDesc.country,
        temp: weatherDesc.temp,
        feels_like: weatherDesc.feels_like,
        desc: weatherDesc.desc,
        wind_speed: weatherDesc.wind_speed
      });
    }
  }, [weatherDesc, clickCoords]);

  const pointerData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: [clickCoords.lng, clickCoords.lat]
        }
      }
    ]
  };

  const pointerSource = {
    id: 'pointer-source',
    type: 'geojson',
    data: pointerData
  };

  const pointerLayer = {
    id: 'pointer-layer',
    type: 'symbol',
    source: 'pointer-source',
    layout: {
      'icon-image': 'pointer',
      'icon-size': 0.05,
      'icon-rotate': 180,
      'icon-anchor': 'bottom'
    }
  };

  function onMouseMove(event: any) {
    if (isMouseDown) {
      setPopupVisible(false);
    }
  }

  function onMouseDown(event: any) {
    setIsMouseDown(true);
    setPopupVisible(true);
  }

  function onMouseUp(event: any) {
    setIsMouseDown(false);
  }

  function onWheel(event: any) {
    setPopupVisible(false);
  }

  useEffect(() => {
    displayWeather(spbCoords);
  }, []);

  return (
    <div className="div-wrapper">
      <div className="header">
        <title>Weather map</title>
        <h1>Weather map</h1>
      </div>
      <div className="map-wrapper" ref={mapWrapperRef}>
        <Map
          onClick={onMapClick}
          id="map"
          initialViewState={{
            longitude: spbCoords.lng,
            latitude: spbCoords.lat,
            zoom: 1
          }}
          mapStyle="https://api.maptiler.com/maps/streets/style.json?key=tgMhLsjzo9PFbyrDjEbt"
        >
          <MapImage
            imageName="bin/images/pointer.png"
            imageID="pointer"
          ></MapImage>
          <Source id="pointer-source" type="geojson" data={pointerData}>
            <Layer
              id="pointer-layer"
              type="symbol"
              source="pointer-source"
              layout={{
                'icon-image': 'pointer',
                'icon-size': 0.04,
                'icon-anchor': 'bottom'
              }}
            />
          </Source>
          {popupInfo && (
            <div
            // className="popup"
            // style={{ left: popupInfo.longitude, top: popupInfo.latitude }}
            >
              <Popup
                longitude={popupInfo.longitude}
                latitude={popupInfo.latitude}
                closeButton={true}
                closeOnClick={true}
                anchor="bottom"
                onClose={() => setPopupInfo(null)}
              >
                <h2>
                  {popupInfo.name}, {popupInfo.country}
                </h2>
                <p>Temperature: {Math.trunc(popupInfo.temp)}°C</p>
                <p>Feels like: {Math.trunc(popupInfo.feels_like)}°C</p>
                <p>Description: {popupInfo.desc}</p>
                <p>Wind speed: {popupInfo.wind_speed}</p>
              </Popup>
            </div>
          )}
        </Map>
      </div>
    </div>
  );
}
