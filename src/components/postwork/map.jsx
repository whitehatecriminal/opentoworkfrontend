"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
    LocateFixed,
    Search,
    Loader2,
    AlertCircle,
    Navigation,
} from "lucide-react";
import { getCurrentLocation, reverseGeocode } from "@/src/config/permission";

/**
 * Interactive Leaflet Location Picker Map Component
 *
 * Supports:
 * 1. Pinpoint selection by clicking on the map.
 * 2. Draggable marker to refine coordinates.
 * 3. "Use Current Location" GPS trigger with permission request.
 * 4. Place / Address search bar using Nominatim.
 * 5. Reverse geocoded address badge.
 *
 * @param {Object} props
 * @param {number} [props.latitude] - Current selected latitude
 * @param {number} [props.longitude] - Current selected longitude
 * @param {({ latitude: number, longitude: number, address?: string }) => void} props.onLocationChange
 * @param {string} [props.className] - Additional wrapper classes
 * @param {string} [props.height] - Map height (default: "320px")
 */
export default function LocationMap({
    latitude,
    longitude,
    onLocationChange,
    className = "",
    height = "320px",
    readOnly = false,
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const iconRef = useRef(null);

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [resolvedAddress, setResolvedAddress] = useState("");

    const onLocationChangeRef = useRef(onLocationChange);
    useEffect(() => {
        onLocationChangeRef.current = onLocationChange;
    });

    const readOnlyRef = useRef(readOnly);
    useEffect(() => {
        readOnlyRef.current = readOnly;
    });

    const initialCoordsRef = useRef({ latitude, longitude });

    const updateAddress = useCallback((lat, lng, notifyParent = true) => {
        if (lat && lng) {
            reverseGeocode(lat, lng).then((res) => {
                const addr = res?.displayName || "";
                setResolvedAddress(addr);
                if (notifyParent && addr) {
                    onLocationChangeRef.current?.({
                        latitude: lat,
                        longitude: lng,
                        address: addr,
                        fullAddress: addr,
                    });
                }
            });
        } else {
            setResolvedAddress("");
        }
    }, []);

    const updateAddressRef = useRef(updateAddress);
    useEffect(() => {
        updateAddressRef.current = updateAddress;
    });

    // Update reverse geocoded address on initial mount if coords provided
    useEffect(() => {
        let active = true;
        if (initialCoordsRef.current.latitude && initialCoordsRef.current.longitude) {
            reverseGeocode(
                initialCoordsRef.current.latitude,
                initialCoordsRef.current.longitude
            ).then((res) => {
                if (active && res?.displayName) {
                    setResolvedAddress(res.displayName);
                }
            });
        }
        return () => {
            active = false;
        };
    }, []);

    // Initialize Leaflet Map
    useEffect(() => {
        let isMounted = true;
        let localMap = null;

        // Dynamically load Leaflet to avoid SSR window error
        import("leaflet").then((L) => {
            if (!isMounted || !mapContainerRef.current) return;

            // Prevent re-initialization if container already has a Leaflet instance
            if (mapContainerRef.current._leaflet_id) {
                return;
            }

            // Modern SVG Pin Marker Icon
            const customIcon = L.divIcon({
                className: "custom-leaflet-marker",
                html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; pointer-events: auto;">
            <div style="position: absolute; width: 16px; height: 16px; border-radius: 50%; background-color: #EA580C; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#EA580C" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transform: translateY(-8px);">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3" fill="#FFFFFF"></circle>
            </svg>
          </div>
        `,
                iconSize: [38, 38],
                iconAnchor: [19, 32],
                popupAnchor: [0, -30],
            });
            iconRef.current = customIcon;

            // Default center: India / Delhi if none selected
            const initLat = initialCoordsRef.current.latitude || 28.6139;
            const initLng = initialCoordsRef.current.longitude || 77.2090;
            const initZoom =
                initialCoordsRef.current.latitude && initialCoordsRef.current.longitude
                    ? 15
                    : 5;

            const map = L.map(mapContainerRef.current, {
                center: [initLat, initLng],
                zoom: initZoom,
                zoomControl: false,
            });

            // Add Zoom control at bottom right
            L.control.zoom({ position: "bottomright" }).addTo(map);

            // OpenStreetMap Tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Create initial marker if coordinates provided
            let marker = null;
            if (initialCoordsRef.current.latitude && initialCoordsRef.current.longitude) {
                marker = L.marker(
                    [initialCoordsRef.current.latitude, initialCoordsRef.current.longitude],
                    {
                        icon: customIcon,
                        draggable: !readOnlyRef.current,
                    }
                ).addTo(map);

                if (!readOnlyRef.current) {
                    marker.on("dragend", (e) => {
                        const pos = e.target.getLatLng();
                        const lat = Number(pos.lat.toFixed(6));
                        const lng = Number(pos.lng.toFixed(6));
                        onLocationChangeRef.current?.({ latitude: lat, longitude: lng });
                        updateAddressRef.current?.(lat, lng);
                    });
                }
            }

            // Map Click Handler
            map.on("click", (e) => {
                if (readOnlyRef.current) return;
                const { lat, lng } = e.latlng;
                const latFixed = Number(lat.toFixed(6));
                const lngFixed = Number(lng.toFixed(6));

                if (marker) {
                    marker.setLatLng([latFixed, lngFixed]);
                } else {
                    marker = L.marker([latFixed, lngFixed], {
                        icon: customIcon,
                        draggable: true,
                    }).addTo(map);

                    marker.on("dragend", (event) => {
                        const pos = event.target.getLatLng();
                        const dLat = Number(pos.lat.toFixed(6));
                        const dLng = Number(pos.lng.toFixed(6));
                        onLocationChangeRef.current?.({
                            latitude: dLat,
                            longitude: dLng,
                        });
                        updateAddressRef.current?.(dLat, dLng);
                    });
                }

                markerRef.current = marker;
                onLocationChangeRef.current?.({ latitude: latFixed, longitude: lngFixed });
                updateAddressRef.current?.(latFixed, lngFixed);
            });

            localMap = map;
            mapInstanceRef.current = map;
            markerRef.current = marker;

            // Ensure proper tile sizing after container render
            setTimeout(() => {
                map.invalidateSize();
            }, 250);
        });

        return () => {
            isMounted = false;
            if (localMap) {
                localMap.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    // Sync external coordinates with Map & Marker
    useEffect(() => {
        if (!mapInstanceRef.current || !latitude || !longitude) return;

        const map = mapInstanceRef.current;
        const currentMarker = markerRef.current;

        if (currentMarker) {
            const pos = currentMarker.getLatLng();
            if (pos.lat !== latitude || pos.lng !== longitude) {
                currentMarker.setLatLng([latitude, longitude]);
                map.flyTo([latitude, longitude], 15, { duration: 1 });
            }
        } else if (iconRef.current) {
            import("leaflet").then((L) => {
                if (!mapInstanceRef.current) return;
                const newMarker = L.marker([latitude, longitude], {
                    icon: iconRef.current,
                    draggable: !readOnlyRef.current,
                }).addTo(mapInstanceRef.current);

                newMarker.on("dragend", (e) => {
                    const pos = e.target.getLatLng();
                    onLocationChangeRef.current?.({
                        latitude: Number(pos.lat.toFixed(6)),
                        longitude: Number(pos.lng.toFixed(6)),
                    });
                });

                markerRef.current = newMarker;
                map.flyTo([latitude, longitude], 15, { duration: 1 });
            });
        }
    }, [latitude, longitude]);

    // Request GPS Location via permission helper
    const handleDetectLocation = useCallback(async () => {
        setLoadingLocation(true);
        setLocationError("");

        try {
            const coords = await getCurrentLocation({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });

            const lat = Number(coords.latitude.toFixed(6));
            const lng = Number(coords.longitude.toFixed(6));

            // Move existing marker or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else if (iconRef.current && mapInstanceRef.current) {
                import("leaflet").then((L) => {
                    if (!mapInstanceRef.current) return;
                    const newMarker = L.marker([lat, lng], {
                        icon: iconRef.current,
                        draggable: !readOnlyRef.current,
                    }).addTo(mapInstanceRef.current);

                    newMarker.on("dragend", (e) => {
                        const pos = e.target.getLatLng();
                        const dLat = Number(pos.lat.toFixed(6));
                        const dLng = Number(pos.lng.toFixed(6));
                        onLocationChangeRef.current?.({
                            latitude: dLat,
                            longitude: dLng,
                        });
                        updateAddressRef.current?.(dLat, dLng, true);
                    });

                    markerRef.current = newMarker;
                });
            }

            if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([lat, lng], 16, {
                    duration: 1.2,
                });
            }

            // Immediately reverse geocode to get human-readable full address
            let addr = "";
            try {
                const geo = await reverseGeocode(lat, lng);
                addr = geo?.displayName || "";
            } catch (e) {
                console.warn("Reverse geocoding error:", e);
            }

            setResolvedAddress(addr);

            onLocationChangeRef.current?.({
                latitude: lat,
                longitude: lng,
                address: addr,
                fullAddress: addr,
                isCurrentLocation: true,
            });
        } catch (err) {
            setLocationError(err.message || "Failed to retrieve location.");
        } finally {
            setLoadingLocation(false);
        }
    }, []);

    // Search Address / Place via Nominatim
    const handleSearch = useCallback(
        async (e) => {
            e?.preventDefault();
            const query = searchQuery.trim();
            if (!query) return;

            setSearching(true);
            setLocationError("");

            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                        query
                    )}&limit=1`,
                    {
                        headers: {
                            "Accept-Language": "en",
                        },
                    }
                );

                if (!res.ok) throw new Error("Place search failed.");
                const results = await res.json();

                if (results && results.length > 0) {
                    const first = results[0];
                    const lat = Number(parseFloat(first.lat).toFixed(6));
                    const lng = Number(parseFloat(first.lon).toFixed(6));

                    onLocationChangeRef.current?.({
                        latitude: lat,
                        longitude: lng,
                        address: first.display_name,
                        fullAddress: first.display_name,
                    });
                    setResolvedAddress(first.display_name);

                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
                    }
                } else {
                    setLocationError("Location not found. Try entering a different place name or postal code.");
                }
            } catch (err) {
                setLocationError("Search error: " + (err.message || "Could not search location."));
            } finally {
                setSearching(false);
            }
        },
        [searchQuery]
    );

    return (
        <div className={`flex flex-col gap-2.5 w-full ${className}`}>

            {/* ── TOP ACTION BAR: Search & Geolocation Button ── */}
            {!readOnly && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search city, area, or address on map..."
                            className="w-full pl-9 pr-20 py-2 text-xs sm:text-sm bg-white border border-[#E5DDD0] rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/15 transition-all shadow-2xs"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        <button
                            type="submit"
                            disabled={searching || !searchQuery.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#EDE6DA] text-stone-700 disabled:opacity-40 text-xs font-semibold rounded-md border border-[#E5DDD0] transition-colors"
                        >
                            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
                        </button>
                    </form>

                    {/* Current Location Trigger Button */}
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={loadingLocation}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
                    >
                        {loadingLocation ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Detecting...</span>
                            </>
                        ) : (
                            <>
                                <LocateFixed className="w-4 h-4" />
                                <span>Use My Location</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* ── ERROR ALERT ── */}
            {locationError && !readOnly && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{locationError}</span>
                </div>
            )}

            {/* ── MAP CONTAINER ── */}
            <div className="relative w-full rounded-xl overflow-hidden border border-[#E5DDD0] shadow-2xs bg-[#FAF7F2]">
                <div
                    ref={mapContainerRef}
                    style={{ height }}
                    className="w-full z-0 cursor-crosshair"
                />

                {/* Hint Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
                        <Navigation className="w-3 h-3 text-[#EA580C]" />
                        <span>{readOnly ? "Pinned Location" : "Click map or drag pin to select exact location"}</span>
                    </div>
                </div>
            </div>

            {/* ── SELECTED COORDINATES & ADDRESS BADGE ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 px-3 py-2 bg-[#FAF7F2] border border-[#E5DDD0] rounded-lg text-xs text-stone-600">


                {resolvedAddress && (
                    <p className="text-stone-500 truncate max-w-md text-[11px]" title={resolvedAddress}>
                        {resolvedAddress}
                    </p>
                )}
            </div>
        </div>
    );
}
