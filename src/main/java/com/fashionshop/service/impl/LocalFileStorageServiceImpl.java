package com.fashionshop.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fashionshop.exception.BusinessException;
import com.fashionshop.service.FileStorageService;

@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final Path uploadDir;

    public LocalFileStorageServiceImpl(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể khởi tạo thư mục upload", ex);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File ảnh không được để trống");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BusinessException("Chỉ chấp nhận file ảnh (jpeg, png, webp, gif)");
        }

        String originalName = Path.of(java.util.Objects.requireNonNullElse(file.getOriginalFilename(), "image"))
                .getFileName().toString();
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }
        String storedName = UUID.randomUUID() + extension;

        try {
            Path target = uploadDir.resolve(storedName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException("Lưu file ảnh thất bại: " + ex.getMessage());
        }

        return "/uploads/" + storedName;
    }
}
