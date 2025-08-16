import * as z from "zod";
import { Hono } from "hono";
import { resolver } from "hono-openapi";
import { describeRoute } from "hono-openapi";
import { ErrorResponses } from "./error";

export namespace Product {
  export const Example = {
    id: "prd_XXXXXX",
    name: "Product X",
  }

  export const Info = z.object({
    id: z.string().meta({
      description: "Identifier",
      example: Example.id,
    }),
    name: z.string().meta({
      description: "The product's name",
      example: Example.name,
    })
  }).meta({
    ref: "Product",
    description: "A product sold by the service",
    example: Example,
  });

  export const route = new Hono()
    .get(
      "/",
      describeRoute({
        tags: ["Product"],
        summary: "List products",
        description: "List all products.",
        responses: {
          200: {
            description: "A list of products.",
            content: {
              "application/json": {
                schema: resolver(
                  z.object({
                    data: Info.array().meta({
                      description: "A list of products",
                      example: [Example],
                    }),
                  })),
                example: { data: [Example] },
              },
            },
          },
          401: ErrorResponses[401],
        },
      }),
      async (c) => {
        const data = [{ id: "prd_123456", name: "Super Cool Product" }];
        return c.json({ data }, 200);
      }
    )
}
