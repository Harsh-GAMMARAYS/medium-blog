import { Context, Next } from "hono";
import { verify } from "hono/jwt";

type Bindings = {
    DATABASE_URL: string,
    JWT_SECRET: string,
};

type Variables = {
    userId: string,
};

export const authMiddleware = async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const AuthHeader = c.req.header("authorization") || "";
    if (!AuthHeader) {
        return c.json({
            error: {
                message: "Authorization header is missing",
                code: "AUTHORIZATION_HEADER_MISSING"
            }
        }, 401);
    }

    const [scheme, token] = AuthHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return c.json({
            error: {
                message: "Invalid authorization header format",
                code: "INVALID_AUTHORIZATION_HEADER_FORMAT"
            }
        }, 401);
    }

    try {
        const response = await verify(token, c.env.JWT_SECRET, 'HS256');

        if (!response.id || typeof response.id !== "string") {
            return c.json({
                error: {
                    message: "Invalid token",
                    code: "INVALID_TOKEN"
                }
            }, 401);
        }
        c.set("userId", response.id);
        await next();
    } catch (error) {
        console.log("JWT verification failed:", error)

        return c.json({
            error: {
                message: "Invalid or expired token",
                code: "INVALID_TOKEN"
            }
        }, 401)
    }
}
