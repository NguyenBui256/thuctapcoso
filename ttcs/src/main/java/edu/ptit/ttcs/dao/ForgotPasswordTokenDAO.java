package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForgotPasswordTokenDAO extends JpaRepository<ForgotPasswordToken, Integer> {
    ForgotPasswordToken findByToken(String token);
}
