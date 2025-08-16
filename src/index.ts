import { Hono } from 'hono'
import { User } from './user'
import { Product } from './product'
import { openAPIRouteHandler } from 'hono-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { ErrorCodes, VisibleError } from './error'
import { HTTPException } from 'hono/http-exception'

const app = new Hono()

export const routes = app
  .route("/user", User.route)
  .route("/product", Product.route)
  .onError((error, c) => {
    if (error instanceof VisibleError) {
      return c.json(error.toResponse(), error.statusCode());
    }

    if (error instanceof HTTPException) {
      return c.json(
        {
          type: "validation",
          code: ErrorCodes.Validation.INVALID_PARAMETER,
          message: "Invalid request",
        },
        400,
      );
    }

    // Handle any other errors as internal server errors
    return c.json(
      {
        type: "internal",
        code: 500,
        message: "Internal server error",
      },
      500,
    );
  });


app.get(
  "/openapi",
  openAPIRouteHandler(routes, {
    documentation: {
      openapi: "3.1.0",
      info: {
        title: "Example API",
        version: "0.0.1",
        description: "Example API documentation to reproduce an issue."
      },
      components: {
        securitySchemes: {},
      },
      security: [],
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local server",
        },
      ],
    },
    includeEmptyPaths: false,
    excludeStaticFile: true,
    exclude: [],
    excludeMethods: [],
    excludeTags: [],
    defaultOptions: {},
  }),
);

app.get("/", Scalar({ url: "/openapi" }));

export default app
