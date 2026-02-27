// Unit tests for API types and validation
import { describe, it, expect, beforeEach } from "vitest";
import {
  validate,
  validateOrThrow,
  sanitizeInput,
  formatPrice,
  calculateNights,
  // Schemas
  PropertySchema,
  QuoteRequestSchema,
  GuestInfoSchema,
  PropertySearchParamsSchema,
  // Error codes
  ErrorCodes,
} from "../lib/types";

describe("Validation Helpers", () => {
  describe("validate()", () => {
    it("should return success for valid data", () => {
      const validProperty = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Property",
        slug: "test-property",
        destination: "Malta",
        description: "A test property",
        hero_image: null,
        gallery: null,
        amenities: null,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        price_per_night: 150,
        rating: 4.5,
        guesty_listing_id: null,
        guesty_property_id: null,
        check_in: "15:00",
        check_out: "11:00",
        cancellation_policy: "Flexible",
        created_at: new Date().toISOString(),
      };

      const result = validate(PropertySchema, validProperty);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Test Property");
      }
    });

    it("should return errors for invalid data", () => {
      const invalidProperty = {
        id: "invalid-uuid",
        name: "", // Empty name should fail
        slug: "test-property",
        destination: "Malta",
        max_guests: -1, // Negative should fail
        bedrooms: 2,
        bathrooms: 1,
        price_per_night: 150,
      };

      const result = validate(PropertySchema, invalidProperty);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe("validateOrThrow()", () => {
    it("should return data for valid input", () => {
      const validQuote = {
        propertyId: "123e4567-e89b-12d3-a456-426614174000",
        unitId: "123e4567-e89b-12d3-a456-426614174001",
        checkIn: "2024-01-01",
        checkOut: "2024-01-05",
        adults: 2,
      };

      const result = validateOrThrow(QuoteRequestSchema, validQuote);
      expect(result.adults).toBe(2);
    });

    it("should throw for invalid input", () => {
      const invalidQuote = {
        propertyId: "not-a-uuid",
        unitId: "not-a-uuid",
        checkIn: "invalid-date",
        checkOut: "2024-01-05",
        adults: -1,
      };

      expect(() =>
        validateOrThrow(QuoteRequestSchema, invalidQuote)
      ).toThrow();
    });
  });
});

describe("sanitizeInput()", () => {
  it("should escape HTML characters", () => {
    expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
    );
  });

  it("should handle normal strings", () => {
    expect(sanitizeInput("Hello World")).toBe("Hello World");
  });

  it("should trim whitespace", () => {
    expect(sanitizeInput("  test  ")).toBe("test");
  });
});

describe("formatPrice()", () => {
  it("should format EUR correctly", () => {
    expect(formatPrice(150, "EUR")).toBe("€150.00");
  });

  it("should format USD correctly", () => {
    expect(formatPrice(150, "USD")).toBe("$150.00");
  });
});

describe("calculateNights()", () => {
  it("should calculate correct number of nights", () => {
    expect(calculateNights("2024-01-01", "2024-01-05")).toBe(4);
  });

  it("should handle same day (should be 0 or 1)", () => {
    const nights = calculateNights("2024-01-01", "2024-01-01");
    expect(nights).toBeGreaterThanOrEqual(0);
  });
});

describe("GuestInfoSchema", () => {
  it("should validate correct guest info", () => {
    const guest = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "+1234567890",
    };

    const result = validate(GuestInfoSchema, guest);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const guest = {
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
    };

    const result = validate(GuestInfoSchema, guest);
    expect(result.success).toBe(false);
  });

  it("should reject empty first name", () => {
    const guest = {
      firstName: "",
      lastName: "Doe",
      email: "john@example.com",
    };

    const result = validate(GuestInfoSchema, guest);
    expect(result.success).toBe(false);
  });
});

describe("PropertySearchParamsSchema", () => {
  it("should validate empty params", () => {
    const result = validate(PropertySearchParamsSchema, {});
    expect(result.success).toBe(true);
  });

  it("should validate params with filters", () => {
    const params = {
      destination: "Malta",
      guests: 4,
      minPrice: 100,
      maxPrice: 500,
      page: 1,
      limit: 20,
    };

    const result = validate(PropertySearchParamsSchema, params);
    expect(result.success).toBe(true);
  });

  it("should reject invalid page number", () => {
    const params = {
      page: -1, // Invalid
    };

    const result = validate(PropertySearchParamsSchema, params);
    expect(result.success).toBe(false);
  });
});

describe("ErrorCodes", () => {
  it("should have all expected error codes", () => {
    expect(ErrorCodes.LISTING_NOT_FOUND).toBe("LISTING_NOT_FOUND");
    expect(ErrorCodes.MIN_NIGHT_MISMATCH).toBe("MIN_NIGHT_MISMATCH");
    expect(ErrorCodes.PAYMENT_FAILED).toBe("PAYMENT_FAILED");
    expect(ErrorCodes.RATE_LIMIT_EXCEEDED).toBe("RATE_LIMIT_EXCEEDED");
  });
});
