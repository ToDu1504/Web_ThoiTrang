package com.fashionshop.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fashionshop.dto.response.ApiResponse;
import com.fashionshop.exception.BusinessException;
import com.fashionshop.service.OrderService;
import com.fashionshop.service.VnPayService;
import com.fashionshop.service.VnPayService.VnPayCallbackResult;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments/vnpay")
@RequiredArgsConstructor
public class PaymentController {

    private final VnPayService vnPayService;
    private final OrderService orderService;

    @GetMapping("/return")
    public ApiResponse<Map<String, Object>> handleReturn(@RequestParam Map<String, String> params) {
        VnPayCallbackResult result = vnPayService.verifyCallback(params);

        if (!result.validSignature()) {
            throw new BusinessException("Chữ ký không hợp lệ");
        }

        if (result.success()) {
            orderService.markPaymentSuccess(result.orderCode());
        }

        Map<String, Object> data = Map.of(
                "orderCode", result.orderCode(),
                "success", result.success(),
                "responseCode", result.responseCode());

        return ApiResponse.success(
                result.success() ? "Thanh toán thành công" : "Thanh toán thất bại hoặc bị hủy", data);
    }

    @GetMapping("/ipn")
    public Map<String, String> handleIpn(@RequestParam Map<String, String> params) {
        VnPayCallbackResult result = vnPayService.verifyCallback(params);

        if (!result.validSignature()) {
            return Map.of("RspCode", "97", "Message", "Invalid signature");
        }

        try {
            if (result.success()) {
                orderService.markPaymentSuccess(result.orderCode());
            }
            return Map.of("RspCode", "00", "Message", "Confirm Success");
        } catch (Exception ex) {
            return Map.of("RspCode", "01", "Message", "Order not found");
        }
    }
}
