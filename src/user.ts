import * as z from "zod";
import { Hono } from "hono";
import { resolver } from "hono-openapi";
import { describeRoute } from "hono-openapi";
import { ErrorResponses } from "./error";

export namespace User {
  export const Example = {
    id: "usr_XXXXXX",
    name: "John",
  }

  export const Info = z.object({
    id: z.string().meta({
      description: "Identifier",
      example: Example.id,
    }),
    name: z.string().meta({
      description: "The user's name",
      example: Example.name,
    })
  }).meta({
    ref: "User",
    description: "A user of the service",
    example: Example,
  });

  export const route = new Hono()
    .get(
      "/",
      describeRoute({
        tags: ["User"],
        summary: "List users",
        description: "List all users.",
        responses: {
          200: {
            description: "A list of users.",
            content: {
              "application/json": {
                schema: resolver(
                  z.object({
                    data: Info.array().meta({
                      description: "A list of users",
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
        const data = [{ id: "usr_123456", name: "Jane" }];
        return c.json({ data }, 200);
      }
    )
}
