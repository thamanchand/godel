import { useState, useMemo } from "react";

import { Stop } from "../types/busStop";

export const useStopsFilter = (stops: Stop[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [distanceFilter, setDistanceFilter] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchedLocation, setSearchedLocation] = useState("");

  const filteredAndSortedStops = useMemo(() => {
    return stops
      .filter((stop) => {
        const matchesSearch = searchQuery
          ? stop.name.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const matchesDistance =
          distanceFilter === 0 ||
          (stop.distance && stop.distance <= distanceFilter);

        return matchesSearch && matchesDistance;
      })
      .sort((a, b) => {
        const distanceA = a.distance || 0;
        const distanceB = b.distance || 0;
        return sortOrder === "asc"
          ? distanceA - distanceB
          : distanceB - distanceA;
      });
  }, [stops, searchQuery, distanceFilter, sortOrder]);

  return {
    searchQuery,
    setSearchQuery,
    distanceFilter,
    setDistanceFilter,
    sortOrder,
    setSortOrder,
    searchedLocation,
    setSearchedLocation,
    filteredAndSortedStops,
  };
};
