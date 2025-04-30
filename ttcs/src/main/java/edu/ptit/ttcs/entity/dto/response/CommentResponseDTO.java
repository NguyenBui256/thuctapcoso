package edu.ptit.ttcs.entity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDTO {
    private Long id;
    private Long taskId;
    private Long userId;
    private String userFullName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}