package edu.ptit.ttcs.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<?> invalidInputException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        if(message == null) message = "Invalid input: " + ex.getBindingResult().getAllErrors().get(0).getObjectName();
        return ResponseEntity.badRequest().body(Map.of(
                "message", message
        ));
    }

    @ExceptionHandler(value = RequestException.class)
    public ResponseEntity<?> requestExceptionHandler(RequestException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "message", ex.getMessage()
        ));
    }

    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<?> runtimeExceptionHandler(RuntimeException ex) {
        log.info("Runtime Exception: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(Map.of(
                "message", "Runtime exception"
        ));
    }

}
