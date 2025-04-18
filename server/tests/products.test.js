import request from 'supertest';
import app from '../app.js';
import Product from '../models/productModel.js';
import { adminUser, createAdminUser } from './test-utils.js';

describe('Products API', () => {
  let adminToken;

  beforeAll(async () => {
    adminToken = await createAdminUser();
  });

  const testProduct = {
    name: 'Test Phone',
    brand: 'Test Brand',
    category: 'Smartphone',
    description: 'Test Description',
    variants: JSON.stringify([{
      color: 'Black',
      storage: '128GB',
      ram: '8GB',
      price: 999,
      quantity: 10
    }]),
    specifications: JSON.stringify({
      display: '6.5" AMOLED',
      processor: 'Test Chip',
      camera: 'Triple 48MP',
      battery: '5000mAh',
      os: 'Android'
    })
  };

  describe('POST /api/products', () => {
    it('should create a product (admin)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Cookie', [`jwt=${adminToken}`])
        .field('name', testProduct.name)
        .field('brand', testProduct.brand)
        .field('category', testProduct.category)
        .field('description', testProduct.description)
        .field('variants', testProduct.variants)
        .field('specifications', testProduct.specifications)
        .attach('images', 'tests/fixtures/test-product.jpg');

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(testProduct.name);
      expect(res.body.images.length).toBe(1);
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(testProduct);

      expect(res.statusCode).toEqual(401);
    });
  });

  // Add tests for GET, PUT, DELETE endpoints
});