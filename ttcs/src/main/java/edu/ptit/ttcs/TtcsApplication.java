package edu.ptit.ttcs;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class TtcsApplication {

	public static void main(String[] args) {
		SpringApplication.run(TtcsApplication.class, args);
	}

}
