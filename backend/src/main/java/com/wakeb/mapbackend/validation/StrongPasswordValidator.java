package com.wakeb.mapbackend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern SPECIAL_CHAR = Pattern.compile("[@#$%!&*]");

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return true;
        }

        return password.length() >= MIN_LENGTH
                && UPPERCASE.matcher(password).find()
                && LOWERCASE.matcher(password).find()
                && SPECIAL_CHAR.matcher(password).find();
    }
}
