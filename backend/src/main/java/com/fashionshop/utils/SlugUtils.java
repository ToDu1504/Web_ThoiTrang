package com.fashionshop.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s\\u0111\\u0110]");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-+");

    private SlugUtils() {
    }

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String noWhitespace = input.trim()
                .replace('đ', 'd')
                .replace('Đ', 'D');
        String normalized = Normalizer.normalize(noWhitespace, Normalizer.Form.NFD);
        String stripped = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = WHITESPACE.matcher(stripped).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = MULTIPLE_HYPHENS.matcher(slug).replaceAll("-");
        return slug.toLowerCase().replaceAll("^-|-$", "");
    }
}
