<<<<<<< HEAD:ttcs/src/main/java/edu/ptit/ttcs/entity/dto/RestResponse.java
package edu.ptit.ttcs.entity.dto;
=======
package edu.ptit.ttcs.dto;
>>>>>>> 51de1c8176c5cdc6608661d9f16261f45cbde4e8:ttcs/src/main/java/edu/ptit/ttcs/dto/RestResponse.java

public class RestResponse<T> {
    private int statusCode;
    private String error;

    // message có thể là string, hoặc arrayList
    private Object message;
    private T data;

    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public Object getMessage() {
        return message;
    }

    public void setMessage(Object message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

}
