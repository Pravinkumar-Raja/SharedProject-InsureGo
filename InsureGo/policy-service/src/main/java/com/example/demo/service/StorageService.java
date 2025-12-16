package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class StorageService {
    
    private final Path uploadDir = Paths.get("uploads");

    public String storePermanently(MultipartFile file, Long userId) throws IOException {
        Files.createDirectories(uploadDir);
        // Create unique filename: userId_uuid_filename
        String uniqueFileName = userId + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = this.uploadDir.resolve(uniqueFileName);
        file.transferTo(filePath);
        return filePath.toString(); 
    }
}
