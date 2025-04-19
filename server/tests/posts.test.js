import request from 'supertest';
import app from '../app.js'; // Import your Express app
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

describe('POST /api/posts', () => {
  let user, token;

  // Create a test user and get auth token
  beforeAll(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Login to get JWT token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    token = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
  });

  it('should create a new post with images', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Cookie', [`jwt=${token}`])
      .field('text', 'Test post content')
      .attach('media', 'tests/fixtures/test-image.jpg'); // Test image

    expect(res.statusCode).toBe(201);
    expect(res.body.text).toBe('Test post content');
    expect(res.body.images).toHaveLength(1);
  });

  it('should fail if not authenticated', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ text: 'Unauthorized post' });

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/posts', () => {
  it('should fetch all posts', async () => {
    await Post.create({ text: 'Post 1', user: 'user123' });
    await Post.create({ text: 'Post 2', user: 'user456' });

    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });
});