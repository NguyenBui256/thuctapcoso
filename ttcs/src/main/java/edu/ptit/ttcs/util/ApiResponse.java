package edu.ptit.ttcs.util;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
public class ApiResponse<T> {
    private String result;    // SUCCESS or ERROR
    private String message;   // success or error message
    private T data;           // return object from service class, if successful

    public ApiResponse(String message) {
        this.message = message;
    }

    public ApiResponse(String success, String message, T data) {
        this.result = success;
        this.message = message;
        this.data = data;
    }

    public ApiResponse<T> data(T data){
        this.data = data;
        return this;
    }

    public ApiResponse<T> message(String message){
        this.message = message;
        return this;
    }

    public ApiResponse<T> result(String result){
        this.result = result;
        return this;
    }
} 