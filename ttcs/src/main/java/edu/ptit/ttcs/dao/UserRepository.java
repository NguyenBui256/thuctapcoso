package edu.ptit.ttcs.dao;

import edu.ptit.ttcs.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query("SELECT u FROM User u WHERE u.username=?1 OR lower(u.email)=lower(?1)")
    Optional<User> findByUsernameOrEmail(String login);

    @Query("SELECT u FROM User u WHERE u.username=?1 OR lower(u.email)=lower(?2)")
    Optional<User> findByUsernameOrEmail(String username, String email);

    @Query("SELECT (count(u) > 0) FROM User u WHERE u.username=?1 OR lower(u.email)=lower(?2)")
    boolean existsByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    @Query("SELECT (count(u) > 0) FROM User u WHERE lower(u.email)=lower(?1)")
    boolean existsByEmail(String email);

    List<User> findAllByUsernameStartsWith(String username);
}