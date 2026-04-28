import { OpenAPIV3 } from "openapi-types";

// ── Reusable response schemas ──────────────────────────────────────────────
const errorResp = {
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
};

const r401 = { description: "Unauthorized", ...errorResp };
const r403 = { description: "Forbidden (admin only)", ...errorResp };
const r404 = { description: "Not found", ...errorResp };
const r500 = { description: "Server error", ...errorResp };

function ok(ref: string, description = "Success") {
  return {
    description,
    content: { "application/json": { schema: { $ref: ref } } },
  };
}

function okInline(schema: object, description = "Success") {
  return {
    description,
    content: { "application/json": { schema } },
  };
}

const adminAuth = [{ cookieAuth: [] }];
const userAuth = [{ cookieAuth: [] }];

// ── Spec ───────────────────────────────────────────────────────────────────
export const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "Parlour API",
    version: "1.0.0",
    description:
      "Full REST API for the Parlour e-commerce application. Auth endpoints set an httpOnly `parlour_session` cookie automatically.",
  },
  servers: [{ url: "/api", description: "API base path" }],
  tags: [
    { name: "Auth", description: "Authentication & session" },
    { name: "Products", description: "Product catalogue" },
    { name: "Categories", description: "Product categories" },
    { name: "Services", description: "Service packages" },
    { name: "Cart", description: "Shopping cart" },
    { name: "Orders", description: "User orders" },
    { name: "Admin", description: "Admin-only endpoints" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "parlour_session",
        description: "JWT session cookie (set automatically on login/register)",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Hair Care" },
          description: { type: "string", example: "All hair care products" },
        },
      },
      Product: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          category: {
            type: "object",
            nullable: true,
            properties: { _id: { type: "string" }, name: { type: "string" } },
          },
          stock: { type: "integer" },
          image: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "description", "price", "category", "stock"],
        properties: {
          name: { type: "string", example: "Shampoo" },
          description: { type: "string" },
          price: { type: "number", example: 12.99 },
          category: { type: "string", description: "Category ID" },
          stock: { type: "integer", example: 100 },
          image: { type: "string", nullable: true },
        },
      },
      ServiceProduct: {
        type: "object",
        properties: {
          productId: { type: "string" },
          quantity: { type: "integer" },
        },
      },
      Service: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          basePrice: { type: "number" },
          totalPrice: { type: "number" },
          includedProducts: {
            type: "array",
            items: { $ref: "#/components/schemas/ServiceProduct" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ServiceInput: {
        type: "object",
        required: ["name", "description", "basePrice"],
        properties: {
          name: { type: "string", example: "Full Hair Treatment" },
          description: { type: "string" },
          basePrice: { type: "number", example: 49.99 },
          includedProducts: {
            type: "array",
            items: { $ref: "#/components/schemas/ServiceProduct" },
          },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          itemType: { type: "string", enum: ["product", "service"] },
          quantity: { type: "integer" },
          snapshotPrice: { type: "number" },
          snapshotData: { type: "object" },
          addedAt: { type: "string", format: "date-time" },
        },
      },
      Cart: {
        type: "object",
        properties: {
          items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          itemType: { type: "string", enum: ["product", "service"] },
          name: { type: "string" },
          price: { type: "number" },
          quantity: { type: "integer" },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string" },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          totalAmount: { type: "number" },
          status: { type: "string", enum: ["pending", "completed", "cancelled"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["user", "admin"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    // ── Auth ──────────────────────────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          "201": okInline({ $ref: "#/components/schemas/User" }, "User created & session cookie set"),
          "400": { description: "Validation error", ...errorResp },
          "409": { description: "Email already exists", ...errorResp },
          "500": r500,
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  rememberMe: { type: "boolean", default: false },
                },
              },
            },
          },
        },
        responses: {
          "200": okInline({ $ref: "#/components/schemas/User" }, "Logged in, session cookie set"),
          "401": { description: "Invalid credentials", ...errorResp },
          "500": r500,
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout — clears session cookie",
        responses: {
          "200": okInline({ type: "object", properties: { loggedOut: { type: "boolean" } } }),
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: userAuth,
        responses: {
          "200": ok("#/components/schemas/User"),
          "401": r401,
          "500": r500,
        },
      },
    },

    // ── Categories ────────────────────────────────────────────────────────
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        responses: {
          "200": okInline({ type: "array", items: { $ref: "#/components/schemas/Category" } }),
          "500": r500,
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category (admin)",
        security: adminAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } },
        },
        responses: {
          "201": ok("#/components/schemas/Category", "Category created"),
          "401": r401,
          "403": r403,
          "500": r500,
        },
      },
    },
    "/categories/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Categories"],
        summary: "Get category by ID",
        responses: {
          "200": ok("#/components/schemas/Category"),
          "404": r404,
          "500": r500,
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update category (admin)",
        security: adminAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } },
        },
        responses: {
          "200": ok("#/components/schemas/Category"),
          "401": r401,
          "403": r403,
          "404": r404,
          "500": r500,
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete category (admin)",
        security: adminAuth,
        responses: {
          "200": okInline({ type: "object", properties: { deleted: { type: "boolean" } } }),
          "401": r401,
          "403": r403,
          "404": r404,
          "500": r500,
        },
      },
    },

    // ── Products ──────────────────────────────────────────────────────────
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List all products",
        responses: {
          "200": okInline({ type: "array", items: { $ref: "#/components/schemas/Product" } }),
          "500": r500,
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product (admin)",
        security: adminAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } },
        },
        responses: {
          "201": ok("#/components/schemas/Product", "Product created"),
          "401": r401,
          "403": r403,
          "500": r500,
        },
      },
    },
    "/products/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        responses: {
          "200": ok("#/components/schemas/Product"),
          "404": r404,
          "500": r500,
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product (admin)",
        security: adminAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } },
        },
        responses: {
          "200": ok("#/components/schemas/Product"),
          "401": r401,
          "403": r403,
          "404": r404,
          "500": r500,
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product (admin)",
        security: adminAuth,
        responses: {
          "200": okInline({ type: "object", properties: { deleted: { type: "boolean" } } }),
          "401": r401,
          "403": r403,
          "404": r404,
          "500": r500,
        },
      },
    },

    // ── Services ──────────────────────────────────────────────────────────
    "/services": {
      get: {
        tags: ["Services"],
        summary: "List all services",
        responses: {
          "200": okInline({ type: "array", items: { $ref: "#/components/schemas/Service" } }),
          "500": r500,
        },
      },
      post: {
        tags: ["Services"],
        summary: "Create a service (admin)",
        security: adminAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceInput" } } },
        },
        responses: {
          "201": ok("#/components/schemas/Service", "Service created"),
          "401": r401,
          "403": r403,
          "500": r500,
        },
      },
    },
    "/services/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Services"],
        summary: "Get service by ID",
        responses: {
          "200": ok("#/components/schemas/Service"),
          "404": r404,
          "500": r500,
        },
      },
      put: {
        tags: ["Services"],
        summary: "Update service (admin)",
        security: adminAuth,
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ServiceInput" } } },
        },
        responses: {
          "200": ok("#/components/schemas/Service"),
          "401": r401,
          "403": r403,
          "404": r404,
          "500": r500,
        },
      },
      delete: {
        tags: ["Services"],
        summary: "Delete service (admin)",
        security: adminAuth,
        responses: {
          "200": okInline({ type: "object", properties: { deleted: { type: "boolean" } } }),
          "401": r401,
          "403": r403,
          "404": r404,
          "500": r500,
        },
      },
    },

    // ── Cart ──────────────────────────────────────────────────────────────
    "/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user's cart",
        security: userAuth,
        responses: {
          "200": ok("#/components/schemas/Cart"),
          "401": r401,
          "500": r500,
        },
      },
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        security: userAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["itemId"],
                properties: {
                  itemId: { type: "string" },
                  itemType: { type: "string", enum: ["product", "service"], default: "product" },
                  quantity: { type: "integer", default: 1 },
                },
              },
            },
          },
        },
        responses: {
          "200": ok("#/components/schemas/Cart"),
          "401": r401,
          "500": r500,
        },
      },
      put: {
        tags: ["Cart"],
        summary: "Update item quantity",
        security: userAuth,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["itemId", "quantity"],
                properties: {
                  itemId: { type: "string" },
                  itemType: { type: "string", enum: ["product", "service"], default: "product" },
                  quantity: { type: "integer", minimum: 0 },
                },
              },
            },
          },
        },
        responses: {
          "200": ok("#/components/schemas/Cart"),
          "401": r401,
          "500": r500,
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove item or clear cart",
        description: "Pass `?itemId=<id>&itemType=<type>` to remove one item. Omit query params to clear the entire cart.",
        security: userAuth,
        parameters: [
          { name: "itemId", in: "query", schema: { type: "string" }, description: "Item ID to remove (omit to clear all)" },
          { name: "itemType", in: "query", schema: { type: "string", enum: ["product", "service"] } },
        ],
        responses: {
          "200": ok("#/components/schemas/Cart"),
          "401": r401,
          "500": r500,
        },
      },
    },

    // ── Orders ────────────────────────────────────────────────────────────
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "Get user's orders",
        security: userAuth,
        responses: {
          "200": okInline({
            type: "object",
            properties: {
              orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
              count: { type: "integer" },
            },
          }),
          "401": r401,
          "500": r500,
        },
      },
    },
    "/orders/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: {
        tags: ["Orders"],
        summary: "Get order by ID",
        security: userAuth,
        responses: {
          "200": ok("#/components/schemas/Order"),
          "401": r401,
          "404": r404,
          "500": r500,
        },
      },
    },
    "/checkout": {
      post: {
        tags: ["Orders"],
        summary: "Create order from cart",
        description: "Creates an order from the authenticated user's cart. Cart must not be empty.",
        security: userAuth,
        responses: {
          "200": okInline({
            type: "object",
            properties: {
              orderId: { type: "string" },
              totalAmount: { type: "number" },
            },
          }, "Order created"),
          "400": { description: "Cart empty or validation error", ...errorResp },
          "401": r401,
          "500": r500,
        },
      },
    },

    // ── Admin ─────────────────────────────────────────────────────────────
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin)",
        security: adminAuth,
        responses: {
          "200": okInline({
            type: "object",
            properties: {
              users: { type: "array", items: { $ref: "#/components/schemas/User" } },
              count: { type: "integer" },
            },
          }),
          "401": r401,
          "403": r403,
          "500": r500,
        },
      },
    },
    "/admin/orders": {
      get: {
        tags: ["Admin"],
        summary: "List all orders (admin)",
        security: adminAuth,
        responses: {
          "200": okInline({
            type: "object",
            properties: {
              orders: { type: "array", items: { $ref: "#/components/schemas/Order" } },
              count: { type: "integer" },
            },
          }),
          "401": r401,
          "403": r403,
          "500": r500,
        },
      },
    },
  },
};
