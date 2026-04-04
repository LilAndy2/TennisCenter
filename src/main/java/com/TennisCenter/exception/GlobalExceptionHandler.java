package com.TennisCenter.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of(
                        "timestamp", LocalDateTime.now().toString(),
                        "status", 404,
                        "error", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<?> handleUnauthorizedAction(UnauthorizedActionException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                Map.of(
                        "timestamp", LocalDateTime.now().toString(),
                        "status", 403,
                        "error", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidation(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("timestamp", LocalDateTime.now().toString(),
                        "status", 400,
                        "error", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<?> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                Map.of("timestamp", LocalDateTime.now().toString(),
                        "status", 409,
                        "error", ex.getMessage()
                )
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("timestamp", LocalDateTime.now().toString(),
                        "status", 500,
                        "error", "An unexpected error occurred"
                )
        );
    }
}