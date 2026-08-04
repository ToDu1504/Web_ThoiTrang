package com.fashionshop.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddWishlistRequest {

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;
}
