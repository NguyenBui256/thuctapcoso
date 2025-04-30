package edu.ptit.ttcs.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    private String content;
    private Long userId;
    private String userFullName;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}