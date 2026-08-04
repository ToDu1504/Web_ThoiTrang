import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '../api/cart';
import type { AddCartItemRequest, UpdateCartItemRequest } from '../types/cart';

export function useCart() {
  return useQuery({ queryKey: ['cart'], queryFn: getCart });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCartItemRequest) => addCartItem(payload),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCartItemRequest }) => updateCartItem(id, payload),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeCartItem(id),
    onSuccess: (data) => queryClient.setQueryData(['cart'], data),
  });
}
