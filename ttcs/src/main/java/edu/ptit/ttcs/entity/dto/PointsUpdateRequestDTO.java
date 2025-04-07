package edu.ptit.ttcs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointsUpdateRequestDTO {
    private Integer points;
    
    public void validate() {
        if (points == null) {
            throw new IllegalArgumentException("Points cannot be null");
        }
    }
} 