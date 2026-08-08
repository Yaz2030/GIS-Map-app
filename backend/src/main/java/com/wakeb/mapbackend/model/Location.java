package com.wakeb.mapbackend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @Pattern(
            regexp = "^(religious|education|health|food|fuel|shop|office|residential|generic)$",
            message = "validation.location.category.invalid"
    )
    private String category;

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

     public Location(String name, double latitude, double longitude, String description, String userId, String category) {
         this.name = name;
         this.latitude = latitude;
         this.longitude = longitude;
         this.description = description;
         this.userId = userId;
         this.category = category;
     }
}
