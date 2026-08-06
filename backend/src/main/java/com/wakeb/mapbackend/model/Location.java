package com.wakeb.mapbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
@Document(collection = "locations")
public class Location  {
    @Id
    private String id;
    @NotBlank(message = "validation.location.name.required")
    private String name;

    @Min(value = -90, message = "validation.location.latitude.min")
    @Max(value = 90, message = "validation.location.latitude.max")
    private double latitude;

    @Min(value = -180, message = "validation.location.longitude.min")
    @Max(value = 180, message = "validation.location.longitude.max")
    private double longitude;
    private String description;
    private String userId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Location() {

     }

     public Location(String name, double latitude, double longitude, String description, String userId) {
         this.name = name;
         this.latitude = latitude;
         this.longitude = longitude;
         this.description = description;
         this.userId = userId;
     }
}
