package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableDiscoveryClient
public class VisitServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(VisitServiceApplication.class, args);
	}
	 @Bean
	    @LoadBalanced // <--- THIS IS THE KEY ANNOTATION
	    public RestTemplate restTemplate() {
	        return new RestTemplate();
	    }
}
