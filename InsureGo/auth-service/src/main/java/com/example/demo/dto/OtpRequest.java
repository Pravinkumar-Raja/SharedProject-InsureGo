package com.example.demo.dto;

import lombok.Data;

@Data
public class OtpRequest {
	private String identifier; // This will hold the Phone Number or Email
    private String code;
	public String getIdentifier() {
		return identifier;
	}
	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	} 
    
}
