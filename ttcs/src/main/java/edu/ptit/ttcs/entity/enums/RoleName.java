package edu.ptit.ttcs.entity.enums;

public enum RoleName {
    USER("USER"),
    ADMIN("ADMIN");

    private final String value;

    RoleName(String value){
        this.value = value;
    }

    public String toString(){
        return value;
    }
}