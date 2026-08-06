package com.wakeb.mapbackend.repository;

import java.util.Optional;
import com.wakeb.mapbackend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User,String>{

    Optional<User> findByEmail(String email);

    Optional<User> findByResetPasswordToken(String token);

    Optional<User> findByEmailVerificationToken(String token);

}