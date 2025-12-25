"use client";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { Map, Marker, Popup } from "@maptiler/sdk";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, getStoredUser, logout } from "../../authUtils";

export default function Ward() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [popupData, setPopupData] = useState(null);
  const popupRef = useRef(null);
  const [boundaryCoords, setBoundaryCoords] = useState(null);
  const [selectedLayout, setSelectedLayout] = useState(0);
  const [buildings, setBuildings] = useState([]);

  // Authorization check
  useEffect(() => {
    if (!isAdmin()) {
      router.push("/entry");
      return;
    }
    const currentUser = getStoredUser();
    setUser(currentUser);
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  // Fetch layouts first, then buildings
  // useEffect(() => {
  //   fetch("/api/layouts")
  //     .then((r) => r.json())
  //     .then((j) => {
  //       if (j.data && j.data.length > 0) {
  //         setBoundaryCoords(j.data || null);
  //         // After layouts are loaded, fetch buildings
  //         fetch("/api/buildings")
  //           .then((r2) => r2.json())
  //           .then((b) => {
  //             if (b.data) {
  //               setBuildings(
  //                 b.data
  //                 // .map((building) => {
  //                 //   let positionData = building.extra_data;
  //                 //   // Check if positionData is a JSON string
  //                 //   if (typeof positionData === "string") {
  //                 //     try {
  //                 //       const parsed = JSON.parse(positionData);
  //                 //       // If parsed object has a 'position' property, use it
  //                 //       if (parsed && parsed.position) {
  //                 //         positionData = parsed.position;
  //                 //       } else {
  //                 //         positionData = parsed;
  //                 //       }
  //                 //     } catch (e) {
  //                 //       // Not JSON, leave as is
  //                 //     }
  //                 //   }
  //                 //   return {
  //                 //     name: building.name,
  //                 //     position: positionData,
  //                 //   };
  //                 // })
  //               );
  //             }
  //           });
  //       }
  //     });
  // }, []);

  useEffect(() => {
    if (map.current || !isAuthorized) return;
    if (!boundary) return;
    map.current = new Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
      center: [72.8215, 19.418],
      zoom: 15,
    });
    const layout = boundary;
    map.current.on("load", () => {
      map.current.addSource("boundary", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [layout],
          },
        },
      });

      map.current.addLayer({
        id: "boundary-fill",
        type: "fill",
        source: "boundary",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.25,
        },
      });

      map.current.addLayer({
        id: "boundary-outline",
        type: "line",
        source: "boundary",
        paint: {
          "line-color": "#1d4ed8",
          "line-width": 2,
        },
      });

      // buildings.forEach((loc) => {
      //   const marker = new Marker()
      //     .setLngLat([loc.position[1], loc.position[0]])
      //     .addTo(map.current);

      //   const el = marker.getElement();
      //   el.style.cursor = "pointer"; // make it clear it's clickable
      //   el.addEventListener("click", (e) => {
      //     e.preventDefault();
      //     e.stopPropagation(); // prevent map from handling the click

      //     // compute pixel position of the marker within the map container
      //     const point = map.current.project([loc.position[1], loc.position[0]]);

      //     // store lat/lng and pixel position so we can position the popup beside the marker
      //     setPopupData({
      //       name: loc.name,
      //       lng: loc.position[1],
      //       lat: loc.position[0],
      //       point: { x: point.x, y: point.y },
      //     });
      //   });
      // });
    });
  }, [isAuthorized]);

  // useEffect(() => {
  //   if (!map.current) return;
  //   const updatePopupPosition = () => {
  //     if (!popupData) return;
  //     const p = map.current.project([popupData.lng, popupData.lat]);
  //     setPopupData((prev) =>
  //       prev ? { ...prev, point: { x: p.x, y: p.y } } : prev
  //     );
  //   };
  //   map.current.on("move", updatePopupPosition);
  //   map.current.on("zoom", updatePopupPosition);
  //   return () => {
  //     if (!map.current) return;
  //     map.current.off("move", updatePopupPosition);
  //     map.current.off("zoom", updatePopupPosition);
  //   };
  // }, [popupData]);

  // // close popup when clicking outside it (document click in bubble phase;
  // // marker click uses stopPropagation so it won't be blocked)
  // useEffect(() => {
  //   if (!popupData) return;
  //   const onDocClick = (e) => {
  //     if (popupRef.current && !popupRef.current.contains(e.target)) {
  //       setPopupData(null);
  //     }
  //   };
  //   document.addEventListener("click", onDocClick);
  //   return () => document.removeEventListener("click", onDocClick);
  // }, [popupData]);

  return (
    <div
      style={{
        height: "calc(100vh - 30px)",
        width: "100%",
        position: "relative",
      }}
    >
      <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />
      {popupData && popupData.point && (
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            // offset so the popup appears beside/above the marker
            left: `${popupData.point.x + 12}px`,
            top: `${popupData.point.y - 36}px`,
            background: "white",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.3)",
            zIndex: 10000, // ensure popup is on top of the map
            pointerEvents: "auto",
            transform: "translate(-0%, -0%)",
            whiteSpace: "nowrap",
          }}
        >
          <strong>{popupData.name}</strong>
        </div>
      )}
    </div>
  );
}
