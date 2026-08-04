package com.fashionshop.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.fashionshop.dto.request.ReviewRequest;
import com.fashionshop.dto.response.ReviewResponse;

public interface ReviewService {

    ReviewResponse create(Long userId, ReviewRequest request);

    Page<ReviewResponse> getByProduct(Long productId, Pageable pageable);
}
