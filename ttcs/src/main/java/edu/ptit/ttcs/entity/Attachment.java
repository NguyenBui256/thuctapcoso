package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attachment")
@Setter
@Getter
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="file_name")
    private String filename;
    
    @Column(name = "content_type")
    private String contentType;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "url")
    private String url;

    @Column(name = "is_delete")
    private Boolean isDelete;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}