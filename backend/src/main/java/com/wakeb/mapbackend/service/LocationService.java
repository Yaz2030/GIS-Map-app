package com.wakeb.mapbackend.service;

import com.wakeb.mapbackend.exception.InvalidCredentialsException;
import com.wakeb.mapbackend.model.Location;
import com.wakeb.mapbackend.repository.LocationRepository;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;
import com.wakeb.mapbackend.exception.*;
@Service
public class LocationService {
    private final LocationRepository locationRepository;

    public LocationService(LocationRepository locationRepository) {
        this.locationRepository = locationRepository;
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location addLocation(Location location) {
        return locationRepository.save(location);
    }

    public Location getLocationById(String id, String userId) {
        Optional<Location> existing = locationRepository.findById(id);
        if (existing.isEmpty()) {
            throw new ResourceNotFoundException("error.location.notFound");
        }
        Location location = existing.get();

        if (!location.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("error.location.forbidden");        }
        return location;
    }

    public Location updateLocation(String id, Location location, String userId) {
        Optional<Location> existing = locationRepository.findById(id);
        if (existing.isEmpty()) {
            throw new ResourceNotFoundException("error.location.notFound");
        }
        Location oldLocation = existing.get();

        if (!oldLocation.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("error.location.forbidden");
        }

        oldLocation.setName(location.getName());
        oldLocation.setLatitude(location.getLatitude());
        oldLocation.setLongitude(location.getLongitude());
        oldLocation.setDescription(location.getDescription());

        return locationRepository.save(oldLocation);


    }

    public boolean deleteLocation(String id, String userId) {
        Optional<Location> existing = locationRepository.findById(id);
        if (existing.isEmpty()) {
            throw new ResourceNotFoundException("error.location.notFound");
        }
        Location location = existing.get();
        if (!location.getUserId().equals(userId)) {
           throw new UnauthorizedAccessException("You are not allowed to access this location");
        }
        locationRepository.delete(location);
        return true;
    }

    public List<Location> getLocationsByUserId(String userId) {
        return locationRepository.findByUserId(userId);
    }


}
