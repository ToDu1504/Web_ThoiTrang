package com.fashionshop.service.impl;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fashionshop.dto.request.CategoryRequest;
import com.fashionshop.dto.response.CategoryResponse;
import com.fashionshop.entity.Category;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.exception.ResourceNotFoundException;
import com.fashionshop.repository.CategoryRepository;
import com.fashionshop.service.CategoryService;
import com.fashionshop.utils.SlugUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        applyRequest(category, request);
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findEntity(id);
        applyRequest(category, request);
        categoryRepository.save(category);
        return toResponse(category);
    }

    @Override
    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void delete(Long id) {
        Category category = findEntity(id);
        if (!category.getChildren().isEmpty()) {
            throw new BusinessException("Không thể xóa danh mục đang có danh mục con");
        }
        categoryRepository.delete(category);
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setName(request.getName());
        String slug = (request.getSlug() == null || request.getSlug().isBlank())
                ? SlugUtils.toSlug(request.getName())
                : SlugUtils.toSlug(request.getSlug());
        category.setSlug(slug);

        if (request.getParentId() != null) {
            if (request.getParentId().equals(category.getId())) {
                throw new BusinessException("Danh mục không thể là cha của chính nó");
            }
            Category parent = findEntity(request.getParentId());
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
    }

    private Category findEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .build();
    }
}
