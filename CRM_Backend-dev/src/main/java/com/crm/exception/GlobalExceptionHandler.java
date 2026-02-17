package com.crm.exception;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.crm.model.dto.ErrorDTO;
import com.crm.model.dto.ResponseDTO;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDTO<?>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        ResponseDTO<?> responseDTO = new ResponseDTO<>();
        List<ErrorDTO> errorList = new ArrayList<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errorList.add(new ErrorDTO(UUID.randomUUID().toString(), HttpStatus.BAD_REQUEST.toString(),
                    "Validation Error", fieldName + ": " + errorMessage));
        });

        responseDTO.setErrors(errorList);
        return new ResponseEntity<>(responseDTO, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ResponseDTO<?>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, "Malformed JSON Request");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseDTO<?>> handleAccessDeniedException(AccessDeniedException ex) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, "Access Denied");
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ResponseDTO<?>> handleDuplicateUserException(DuplicateResourceException ex) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, "Duplicate Entry");
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ResponseDTO<?>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, "Invalid Credentials");
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ResponseDTO<?>> handleBadRequestException(BadRequestException ex) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, "Bad Request");
    }

    @ExceptionHandler(ForBiddenException.class)
    public ResponseEntity<ResponseDTO<?>> handleForbiddenException(ForBiddenException ex) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, "Forbidden");
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ResponseDTO<?>> handleNotFoundException(NotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, "Not Found");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDTO<?>> handleGlobalException(Exception ex) {
        return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }

    private <T> ResponseEntity<ResponseDTO<?>> buildErrorResponse(Exception ex, HttpStatus status, String title) {
        ResponseDTO<T> responseDTO = new ResponseDTO<>();

        List<ErrorDTO> errorList = new ArrayList<>();
        errorList.add(
                new ErrorDTO(UUID.randomUUID().toString(), Integer.toString(status.value()), title, ex.getMessage()));

        responseDTO.setErrors(errorList);
        ex.printStackTrace();
        return new ResponseEntity<>(responseDTO, status);
    }
}
