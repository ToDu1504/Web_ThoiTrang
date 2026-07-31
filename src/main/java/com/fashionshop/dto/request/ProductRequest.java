package com.fashionshop.dto.request;

import java.math.BigDecimal;
import java.util.List;

import com.fashionshop.entity.ProductStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String slug;

    private String description;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    private Long brandId;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal basePrice;

    private ProductStatus status;

    @Valid
    private List<ProductVariantRequest> variants;
}
