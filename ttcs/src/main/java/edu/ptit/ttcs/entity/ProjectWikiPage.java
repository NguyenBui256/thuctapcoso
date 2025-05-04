package edu.ptit.ttcs.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_wiki_page")
@Setter
@Getter
//@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class ProjectWikiPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_delete")
    private Boolean isDelete;

    @Column(name = "edit_count")
    private Integer editCount;

    @ManyToMany
    @JoinTable(name = "wiki_page_attachment", joinColumns = @JoinColumn(name = "wiki_page_id", referencedColumnName = "id", columnDefinition = "BIGINT"), inverseJoinColumns = @JoinColumn(name = "attachment_id", referencedColumnName = "id", columnDefinition = "BIGINT"))
    private Set<Attachment> attachments = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @ManyToOne
    @JoinColumn(name = "created_by", updatable = false)
    @JsonIgnoreProperties({"user", "project"})
    private ProjectMember createdBy;

    @LastModifiedBy
    @ManyToOne
    @JoinColumn(name = "updated_by")
    @JsonIgnoreProperties({"user", "project"})
    private ProjectMember updatedBy;
}