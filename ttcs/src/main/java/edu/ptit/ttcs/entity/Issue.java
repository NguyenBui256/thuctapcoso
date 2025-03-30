package edu.ptit.ttcs.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "issue")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue {
    @Id
    @Column(name = "issue_id")
    private Integer issueId;
    
    private Integer id;
    
    @Column(nullable = false, columnDefinition = "text")
    private String name;
    
    @Column(columnDefinition = "text")
    private String description;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @ManyToOne
    @JoinColumn(name = "status_id")
    private PjsettingStatus status;
    
    @ManyToOne
    @JoinColumn(name = "type_id")
    private PjsettingType type;
    
    @ManyToOne
    @JoinColumn(name = "severity_id")
    private PjsettingSeverity severity;
    
    @ManyToOne
    @JoinColumn(name = "priority_id")
    private PjsettingPriority priority;
    
    @ManyToMany
    @JoinTable(
        name = "issue_tag",
        joinColumns = @JoinColumn(name = "issue_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<PjsettingTag> tags;
    
    @ManyToMany
    @JoinTable(
        name = "issue_user",
        joinColumns = @JoinColumn(name = "issue_id"),
        inverseJoinColumns = @JoinColumn(name = "id")
    )
    private Set<User> assignedUsers;
    
    @ManyToMany
    @JoinTable(
        name = "issue_watcher",
        joinColumns = @JoinColumn(name = "issue_id"),
        inverseJoinColumns = @JoinColumn(name = "id")
    )
    private Set<User> watchers;
    
    @ManyToMany
    @JoinTable(
        name = "issue_attachment",
        joinColumns = @JoinColumn(name = "issue_id"),
        inverseJoinColumns = @JoinColumn(name = "attachment_id")
    )
    private Set<Attachment> attachments;
    
    @OneToMany(mappedBy = "issue")
    private Set<Comment> comments;
}
