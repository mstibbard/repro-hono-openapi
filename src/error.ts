import * as z from "zod";
import { resolver } from "hono-openapi";

/**
 * Standard error response schema used for OpenAPI documentation
 */
export const ErrorResponse = z
  .object({
    type: z.enum(["validation", "authentication", "forbidden", "not_found", "rate_limit", "internal"]).meta({
      description: "The error type category",
      examples: ["validation", "authentication"],
    }),
    code: z.string().meta({
      description: "Machine-readable error code identifier",
      examples: ["invalid_parameter", "missing_required_field", "unauthorized"],
    }),
    message: z.string().meta({
      description: "Human-readable error message",
      examples: ["The request was invalid", "Authentication required"],
    }),
    param: z
      .string()
      .optional()
      .meta({
        description: "The parameter that caused the error (if applicable)",
        examples: ["email", "user_id"],
      }),
    details: z.any().optional().meta({
      description: "Additional error context information",
    }),
  })
  // Delete this meta definition to correctly show other model schemas
  // but then ErrorResponse model (obviously) won't be included
  .meta({
    ref: "ErrorResponse",
  });

export type ErrorResponseType = z.infer<typeof ErrorResponse>;

/**
 * Standardized error codes for the API
 */
export const ErrorCodes = {
  // Validation errors (400)
  Validation: {
    INVALID_PARAMETER: "invalid_parameter",
    MISSING_REQUIRED_FIELD: "missing_required_field",
    INVALID_FORMAT: "invalid_format",
    ALREADY_EXISTS: "already_exists",
    IN_USE: "resource_in_use",
    INVALID_STATE: "invalid_state",
  },

  // Authentication errors (401)
  Authentication: {
    UNAUTHORIZED: "unauthorized",
    INVALID_TOKEN: "invalid_token",
    EXPIRED_TOKEN: "expired_token",
    INVALID_CREDENTIALS: "invalid_credentials",
  },
};

/**
 * Standard error that will be exposed to clients through API responses
 */
export class VisibleError extends Error {
  constructor(
    public type: ErrorResponseType["type"],
    public code: string,
    public message: string,
    public param?: string,
    public details?: unknown,
  ) {
    super(message);
  }

  /**
   * Convert this error to an HTTP status code
   */
  public statusCode(): number {
    switch (this.type) {
      case "validation":
        return 400;
      case "authentication":
        return 401;
      case "forbidden":
        return 403;
      case "not_found":
        return 404;
      case "rate_limit":
        return 429;
      case "internal":
        return 500;
    }
  }

  /**
   * Convert this error to a standard response object
   */
  public toResponse(): ErrorResponseType {
    const response: ErrorResponseType = {
      type: this.type,
      code: this.code,
      message: this.message,
    };

    if (this.param) response.param = this.param;
    if (this.details) response.details = this.details;

    return response;
  }
}

export const ErrorResponses = {
  400: {
    content: {
      "application/json": {
        schema: resolver(
          ErrorResponse.meta({
            description: "Validation error",
          }),
        ),
        example: {
          type: "validation",
          code: "invalid_parameter",
          message: "The request was invalid",
          param: "email",
        },
      },
    },
    description: "Bad Request",
  },
  401: {
    content: {
      "application/json": {
        schema: resolver(
          ErrorResponse.meta({
            description: "Authentication error",
          }),
        ),
        example: {
          type: "authentication",
          code: "unauthorized",
          message: "Authentication required",
        },
      },
    },
    description: "Unauthorized",
  },
};

