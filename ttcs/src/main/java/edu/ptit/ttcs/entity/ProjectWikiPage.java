package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_wiki_page")
@Setter
@Getter
public class ProjectWikiPage extends BaseEntity{

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
    @JoinTable(name = "wiki_page_attachment", joinColumns = @JoinColumn(name = "wiki_page_id"), inverseJoinColumns = @JoinColumn(name = "attachment_id"))
    private Set<Attachment> attachments = new HashSet<>();
}