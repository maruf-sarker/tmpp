import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('name', 'Test User')
      .field('email', 'test@example.com')
      .field('password', 'password123')
      .attach('avatar', 'tests/fixtures/test-avatar.jpg');

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login existing user', async () => {
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});