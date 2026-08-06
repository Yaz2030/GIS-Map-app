package com.wakeb.mapbackend.controller;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.wakeb.mapbackend.model.Location;

import com.wakeb.mapbackend.service.LocationService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public List<Location> getLocations(Authentication authentication) {

        String userId = authentication.getName();

        return locationService.getLocationsByUserId(userId);
    }

    @PostMapping
    public Location addLocation(@Valid @RequestBody Location location, Authentication authentication) {
        String userId = authentication.getName();
        location.setUserId(userId);

        return locationService.addLocation(location);
    }


    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable String id, Authentication authentication) {

        String userId = authentication.getName();

        Location location = locationService.getLocationById(id, userId);



        return ResponseEntity.ok(location);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(
            @PathVariable String id,
            @Valid @RequestBody Location location,
            Authentication authentication
    ) {
        String userId = authentication.getName();

        Location updatedLocation = locationService.updateLocation(id, location, userId);

        if (updatedLocation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedLocation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String id,  Authentication authentication) {
        String userId = authentication.getName();

        boolean deleted = locationService.deleteLocation(id, userId);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();

    }
}