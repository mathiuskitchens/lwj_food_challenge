import { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import './App.css'
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api"

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY


const App = () => {

  const [selectedPlace, setSelectedPlace] = useState(null);



  const [markerRef, marker] = useAdvancedMarkerRef();
  const challenges = useQuery(api.challenges.get)


  return (
    <>
      <div>
        <h1 className='text-3xl font-bold mb-24'>Local Food Challenges</h1>
        <div id='app-wrapper' className='lg:flex w-full h-full'>

          <div id='map-element' className='w-1/2 h-1/2 justify-center font-bold text-2xl'>
            Add a Challenge
            <APIProvider apiKey={API_KEY} solutionChannel=""
            >
              <Map
                mapId={"f9f2f9f3645414a3"}
                style={{ width: '50vh', height: '50vh' }}
                defaultCenter={{ lat: 39.964214, lng: -82.997216 }}
                defaultZoom={12}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                colorScheme='DARK'
                onClick={(e) => {
                  console.log(e.detail.latLng)
                  console.log(e.detail.placeId)

                }}
              >
                <AdvancedMarker ref={markerRef} position={null} />

              </Map>
              <MapControl position={ControlPosition.TOP}>
                <div className="autocomplete-control">
                  <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
                </div>
              </MapControl>
              <MapHandler place={selectedPlace} marker={marker} />
            </APIProvider>
          </div>
          <div id='challenges' className='w-1/2'>
            <div className="font-bold text-2xl mb-6">Current Challenges</div>
            {challenges?.map(({ _id, name, description, lat, lng, placeId }) =>
              <div className="card bg-primary-content mx-auto my-2 p-8 w-96 max-h-40 "
                key={_id}
              >
                {name}
                <div>{description}</div>
                <button className="btn m-2 w-2/3 mx-auto"

                >Complete Challenge</button>

              </div>

            )}
          </div>
        </div>
      </div >

    </>
  )
}

const MapHandler = ({ place, marker }) => {
  const map = useMap();


  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.geometry?.location) {
      map.setCenter(place.geometry.location)
    }

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
    }

    marker.position = place.geometry?.location;
  }, [map, place, marker]);
  return null;
};

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  const [challengePlace, setChallengePlace] = useState({
    placeId: 0,
    name: "",
    lat: "0",
    lng: "0",
    description: "",
    prize: ""
  })

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);
  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace()
      setChallengePlace(prevState => ({
        ...prevState,
        placeId: "0",
        name: place.name
      }))
      console.log("place", placeAutocomplete)
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  const createChallenge = useMutation(api.challenges.createChallenge)
  const handleCreate = () => {
    createChallenge({
      name: challengePlace.name,
      placeId: challengePlace.placeId,
      lat: challengePlace.lat,
      lng: challengePlace.lng,
      description: challengePlace.description,
      prize: challengePlace.prize
    })
  }

  const handleDescriptionChange = (d) => {
    setChallengePlace(prevState => ({
      ...prevState,
      description: d
    }))
  }

  const handlePrizeChange = (p) => {
    setChallengePlace(prevState => ({
      ...prevState,
      prize: p
    }))
  }

  return (
    <>
      <div className="autocomplete-container">
        <input placeholder="Enter Challenge Restaurant" className="h-12 w-96 text-lg rounded-lg text-left pl-3 mt-3" ref={inputRef} />
        <button className="block btn w-38 text-sm rounded-2xl text-left pl-3 mt-3" onClick={() => document.getElementById('my_modal_1').showModal()
        }>+ Challenge here</button>
      </div>
      <dialog id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{challengePlace.name}</h3>
          <input
            type="text"
            placeholder="What's the challenge"
            className="input input-bordered input-primary w-full max-w-xs my-2"
            onChange={(e) => { handleDescriptionChange(e.target.value) }}
          />
          <input
            type="text"
            placeholder="What's the prize"
            className="input input-bordered input-primary w-full max-w-xs"
            onChange={(e) => { handlePrizeChange(e.target.value) }}

          />
          <div className="modal-action">
            <form method="modal">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-secondary"
                onClick={(e) => {
                  console.log(challengePlace)
                  e.preventDefault()
                  handleCreate()
                  document.getElementById('my_modal_1').close()
                }
                }
              >Submit Challenge</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default App;
