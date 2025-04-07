package edu.ptit.ttcs.entity;

import edu.ptit.ttcs.util.RandomUtil;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "forgot_password_tokens")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ForgotPasswordToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "token", length = 15)
    @Builder.Default
    private String token = RandomUtil.getRandomString(15);

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at")
    @Builder.Default
    private Date createdAt = new Date();

    @Column(name = "expired_at")
    private Date expiredAt;

}
