import request from "supertest";
import app from "../app.js";
import Product from "../models/productModel.js";
import { createTestUser } from "./test-utils.js";

describe("Orders API", () => {
  let user, token, product;

  beforeAll(async () => {
    // Create test user
    const testUser = await createTestUser({
      name: "Order Test User",
      email: "order@test.com",
      password: "password123",
    });
    user = testUser.user;
    token = testUser.token;

    // Create test product
    product = await Product.create({
      name: "Order Test Product",
      brand: "Test Brand",
      category: "Smartphone",
      description: "Test Description",
      variants: [
        {
          color: "Black",
          storage: "128GB",
          ram: "8GB",
          price: 999,
          quantity: 10,
        },
      ],
    });
  });

  describe("POST /api/orders", () => {
    it("should create new order", async () => {
      const orderItems = [
        {
          product: product._id,
          variant: {
            color: "Black",
            storage: "128GB",
            ram: "8GB",
          },
          name: product.name,
          image: "/images/sample.jpg",
          price: 999,
          quantity: 1,
        },
      ];

      const res = await request(app)
        .post("/api/orders")
        .set("Cookie", [`jwt=${token}`])
        .send({
          orderItems,
          shippingAddress: {
            address: "123 Test St",
            city: "Testville",
            postalCode: "12345",
            country: "Testland",
          },
          paymentMethod: "PayPal",
          itemsPrice: 999,
          taxPrice: 99.9,
          shippingPrice: 0,
          totalPrice: 1098.9,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.orderItems.length).toBe(1);
      expect(res.body.user).toBe(user._id.toString());
    });
  });

  // Add more order tests
});
