package com.TennisCenter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TennisCenterApplication {

	public static void main(String[] args) {
		SpringApplication.run(TennisCenterApplication.class, args);
	}

}
