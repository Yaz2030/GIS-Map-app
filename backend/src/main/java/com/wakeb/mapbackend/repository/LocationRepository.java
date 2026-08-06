package com.wakeb.mapbackend.repository;

import com.wakeb.mapbackend.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
public interface LocationRepository extends MongoRepository<Location, String>{

    List<Location> findByUserId(String userId);

    void deleteByUserId(String userId);
}