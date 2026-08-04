package com.fashionshop.service;

import java.util.List;

import com.fashionshop.dto.request.CategoryRequest;
import com.fashionshop.dto.response.CategoryResponse;

public interface CategoryService {

    List<CategoryResponse> getAll();

    CategoryResponse getById(Long id);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}
