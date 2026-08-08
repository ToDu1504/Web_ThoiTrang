package com.fashionshop.controller;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.service.MoMoService;
import com.fashionshop.service.MoMoService.MoMoCallbackResult;
import com.fashionshop.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments/momo")
@RequiredArgsConstructor
public class PaymentController {

    private final MoMoService moMoService;
    private final OrderService orderService;

    @GetMapping("/return")
    public ApiResponse<Map<String, Object>> handleReturn(@RequestParam Map<String, String> params) {
        MoMoCallbackResult result = moMoService.verifyCallback(params);

        if (!result.validSignature()) {
            throw new BusinessException("Chữ ký không hợp lệ");
        }

        if (result.success()) {
            orderService.markPaymentSuccess(result.orderCode());
        }

        Map<String, Object> data = Map.of(
                "orderCode", result.orderCode(),
                "success", result.success(),
                "resultCode", result.resultCode());

        return ApiResponse.success(
                result.success() ? "Thanh toán thành công" : "Thanh toán thất bại hoặc bị hủy", data);
    }

    @PostMapping("/ipn")
    public Map<String, Object> handleIpn(@RequestBody Map<String, Object> body) {
        Map<String, String> params = body.entrySet().stream()
                .collect(Collectors.toMap(Map.Entry::getKey, entry -> String.valueOf(entry.getValue())));

        MoMoCallbackResult result = moMoService.verifyCallback(params);

        if (!result.validSignature()) {
            return Map.of("resultCode", 97, "message", "Invalid signature");
        }

        try {
            if (result.success()) {
                orderService.markPaymentSuccess(result.orderCode());
            }
            return Map.of("resultCode", 0, "message", "Confirm Success");
        } catch (Exception ex) {
            return Map.of("resultCode", 1, "message", "Order not found");
        }
    }
}
