'use client';

/**
 * Proximity-Based Location Filter Component
 * Implements Milan → Turin → Brescia progression logic
 * Shows nearby city suggestions when jobs are limited
 */

import React, { useState, useEffect, useCallback } from 'react';
// Using inline SVG icons to avoid type conflicts
import { jobsApiClient } from '@/lib/services/jobsApiClient';
import type { JobFilters } from '@/components/jobs/types/filters';

interface ProximityLocationFilterProps {
  currentLocation: string;
  filters: JobFilters;
  onLocationChange: (location: string) => void;
  onExpandSearch: (expandedResults: any) => void;
  jobCount: number;
}

interface ProximityData {
  location: string;
  proximityInfo: { city: string; distance: number; jobCount: number }[];
  suggestions: {
    expandSearch: boolean;
    nextCities: { city: string; distance: number; jobCount: number }[];
    totalNearbyJobs: number;
  };
}

const ITALIAN_CITIES = [
  'Milan', 'Turin', 'Brescia', 'Rome', 'Naples', 'Florence', 
  'Bologna', 'Genoa', 'Venice', 'Bergamo', 'Verona', 'Padua'
];

export function ProximityLocationFilter({
  currentLocation,
  filters,
  onLocationChange,
  onExpandSearch,
  jobCount
}: ProximityLocationFilterProps) {
  const [proximityData, setProximityData] = useState<ProximityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState(currentLocation);

  // Fetch proximity suggestions when location changes
  const fetchProximityData = useCallback(async (location: string) => {
    if (!location || !ITALIAN_CITIES.includes(location)) return;

    setLoading(true);
    try {
      const response = await jobsApiClient.getProximityJobs({
        location,
        jobType: filters.jobType,
        level: filters.jobLevel,
        remote: filters.remote,
        limit: 20
      });

      if (response.success && response.data) {
        setProximityData(response.data);
        // Show suggestions if few jobs in primary location
        setShowSuggestions(response.data.suggestions.expandSearch);
      }
    } catch (error) {
      console.error('Error fetching proximity data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update proximity data when location or filters change
  useEffect(() => {
    if (currentLocation) {
      fetchProximityData(currentLocation);
    }
  }, [currentLocation, fetchProximityData]);

  const handleLocationSubmit = useCallback(() => {
    onLocationChange(locationInput);
  }, [locationInput, onLocationChange]);

  const handleCitySelect = useCallback((city: string) => {
    setLocationInput(city);
    onLocationChange(city);
    setShowSuggestions(false);
  }, [onLocationChange]);

  const handleExpandSearch = useCallback(async () => {
    if (!proximityData) return;

    setLoading(true);
    try {
      const response = await jobsApiClient.expandSearch(proximityData.location, {
        jobType: filters.jobType,
        level: filters.jobLevel,
        remote: filters.remote,
        skills: filters.skills
      });

      if (response.success) {
        onExpandSearch(response.data);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error expanding search:', error);
    } finally {
      setLoading(false);
    }
  }, [proximityData, filters, onExpandSearch]);

  const getLocationIcon = (city: string) => {
    const icons: Record<string, string> = {
      'Milan': '🏙️',
      'Turin': '🏭',
      'Brescia': '🏘️',
      'Rome': '🏛️',
      'Naples': '🌋',
      'Florence': '🎨'
    };
    return icons[city] || '📍';
  };

  return (
    <div className="space-y-3">
      {/* Enhanced Location Input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          type="text"
          placeholder="Enter city (Milan, Turin, Rome...)"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onBlur={handleLocationSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLocationSubmit();
            }
          }}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Current Location Results */}
      {currentLocation && jobCount > 0 && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getLocationIcon(currentLocation)}</span>
            <span className="text-sm font-medium text-green-800">{currentLocation}</span>
            <span className="text-xs text-green-600">{jobCount} jobs found</span>
          </div>
        </div>
      )}

      {/* Proximity Suggestions */}
      {showSuggestions && proximityData && proximityData.suggestions.nextCities.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="text-sm font-medium text-amber-800">Limited jobs in {currentLocation}</h4>
              <p className="text-xs text-amber-600">Expand your search to nearby cities</p>
            </div>
            <button
              onClick={handleExpandSearch}
              disabled={loading}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>Expand Search</span>
            </button>
          </div>

          {/* Nearby Cities */}
          <div className="space-y-1">
            <p className="text-xs text-amber-700 font-medium">Nearby cities with jobs:</p>
            {proximityData.suggestions.nextCities.map((city) => (
              <button
                key={city.city}
                onClick={() => handleCitySelect(city.city)}
                className="flex items-center justify-between w-full text-left px-2 py-1 text-xs bg-white border border-amber-200 rounded hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span>{getLocationIcon(city.city)}</span>
                  <span className="font-medium">{city.city}</span>
                  <span className="text-amber-600">({city.distance}km away)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-amber-700">{city.jobCount} jobs</span>
                  <svg className="h-3 w-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {proximityData.suggestions.totalNearbyJobs > 0 && (
            <div className="mt-2 pt-2 border-t border-amber-200">
              <p className="text-xs text-amber-700">
                <strong>{proximityData.suggestions.totalNearbyJobs}</strong> total jobs in nearby cities
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick City Suggestions */}
      <div className="flex flex-wrap gap-1">
        {ITALIAN_CITIES.slice(0, 6).map((city) => (
          <button
            key={city}
            onClick={() => handleCitySelect(city)}
            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
              currentLocation === city
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getLocationIcon(city)} {city}
          </button>
        ))}
      </div>
    </div>
  );
}