package com.wakeb.mapbackend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.wakeb.mapbackend.dto.PlaceSearchResult;
import com.wakeb.mapbackend.exception.ExternalServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@Service
public class FoursquareService {

    // Foursquare retired the api.foursquare.com/v3 endpoints; current API lives under
    // places-api.foursquare.com and requires Bearer auth + a pinned version header.
    private static final String SEARCH_URL = "https://places-api.foursquare.com/places/search";
    private static final String PLACES_API_VERSION = "2025-06-17";
    private static final int RESULT_LIMIT = 10;

    private final RestClient restClient;

    public FoursquareService(@Value("${foursquare.api.key}") String apiKey) {
        this.restClient = RestClient.builder()
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("X-Places-Api-Version", PLACES_API_VERSION)
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public List<PlaceSearchResult> searchPlaces(String query, Double lat, Double lon) {
        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("validation.places.query.required");
        }

        URI uri = UriComponentsBuilder.fromUriString(SEARCH_URL)
                .queryParam("query", query)
                .queryParamIfPresent("ll", buildLl(lat, lon))
                .queryParam("limit", RESULT_LIMIT)
                .build()
                .toUri();

        FoursquareSearchResponse response;
        try {
            response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(FoursquareSearchResponse.class);
        } catch (RestClientException e) {
            throw new ExternalServiceException("error.places.searchFailed");
        }

        if (response == null || response.results() == null) {
            return List.of();
        }

        return response.results().stream()
                .filter(place -> place.latitude() != null && place.longitude() != null)
                .map(this::toSearchResult)
                .toList();
    }

    private PlaceSearchResult toSearchResult(FoursquarePlace place) {
        return new PlaceSearchResult(
                place.name(),
                resolveAddress(place.location()),
                place.latitude(),
                place.longitude()
        );
    }

    private String resolveAddress(FoursquareLocation location) {
        if (location == null) {
            return "";
        }
        if (location.formattedAddress() != null && !location.formattedAddress().isBlank()) {
            return location.formattedAddress();
        }
        return location.address() != null ? location.address() : "";
    }

    private Optional<String> buildLl(Double lat, Double lon) {
        if (lat == null || lon == null) {
            return Optional.empty();
        }
        return Optional.of(lat + "," + lon);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FoursquareSearchResponse(List<FoursquarePlace> results) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FoursquarePlace(String name, Double latitude, Double longitude, FoursquareLocation location) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record FoursquareLocation(
            String address,
            @JsonProperty("formatted_address") String formattedAddress
    ) {
    }
}
