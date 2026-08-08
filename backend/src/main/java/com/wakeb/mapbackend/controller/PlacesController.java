package com.wakeb.mapbackend.controller;

import com.wakeb.mapbackend.dto.PlaceSearchResult;
import com.wakeb.mapbackend.service.FoursquareService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlacesController {

    private final FoursquareService foursquareService;

    public PlacesController(FoursquareService foursquareService) {
        this.foursquareService = foursquareService;
    }

    @GetMapping("/search")
    public List<PlaceSearchResult> search(
            @RequestParam String query,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon
    ) {
        return foursquareService.searchPlaces(query, lat, lon);
    }
}
