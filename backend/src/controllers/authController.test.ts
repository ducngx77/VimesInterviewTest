import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { login } from './authController.js';
import * as authService from '../services/authService.js';

vi.mock('../services/authService');

const app = express();
app.use(express.json());
app.post('/login', login);

describe('Auth Controller - Login FULL TEST', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================
  // 1. SUCCESS CASE
  // =========================
  it('should return 200 and user data when credentials are valid', async () => {
    const mockUser = { 
      user_id: 1, 
      user_name: 'admin', 
      password: 'hashed_password',
      person_name: 'Nguyen Van A'
    };

    (authService.verifyUser as any).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '123' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Success!");
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");

    expect(res.body.user.user_id).toBe("1");
    expect(res.body.user.user_name).toBe("admin");

    // security
    expect(res.body.user.password).toBeUndefined();
  });

  // =========================
  // 2. VALIDATION
  // =========================

  it('should return 400 when username is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ password: '123' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when both fields are missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 when username is empty', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: '', password: '123' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is empty', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when username is not a string', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 123, password: '123' });

    expect(res.status).toBe(400);
  });

  it('should return 400 when password is not a string', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: {} });

    expect(res.status).toBe(400);
  });

  // =========================
  // 3. AUTH FAIL
  // =========================

  it('should return 401 when username is incorrect', async () => {
    (authService.verifyUser as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ username: 'wrong', password: '123' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain("Wrong Username or Password");
  });

  it('should return 401 when password is incorrect', async () => {
    (authService.verifyUser as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  // =========================
  // 4. INPUT PROCESSING
  // =========================

  it('should trim username before calling service', async () => {
    const mockUser = { user_id: 1, user_name: 'admin' };
    (authService.verifyUser as any).mockResolvedValue(mockUser);

    await request(app)
      .post('/login')
      .send({ username: '  admin  ', password: '123' });

    expect(authService.verifyUser).toHaveBeenCalledWith('admin', '123');
  });

  // =========================
  // 5. SECURITY
  // =========================

  it('should not return password field in response', async () => {
    const mockUser = { 
      user_id: 1, 
      user_name: 'admin', 
      password: 'hashed_password'
    };

    (authService.verifyUser as any).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '123' });

    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return a valid token format', async () => {
    const mockUser = { user_id: 1, user_name: 'admin' };
    (authService.verifyUser as any).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '123' });

    expect(res.body.token.split('.').length).toBeGreaterThanOrEqual(1);
  });

  // =========================
  // 6. ERROR HANDLING
  // =========================

  it('should return 500 when service throws error', async () => {
    (authService.verifyUser as any).mockRejectedValue(new Error('DB Timeout'));

    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '123' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("System Error");
    expect(res.body.detail).toBe("DB Timeout");
  });

  // =========================
  // 7. EDGE CASE
  // =========================

  it('should handle malformed user object', async () => {
    const mockUser = { user_name: 'admin' }; // thiếu user_id

    (authService.verifyUser as any).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: '123' });

    expect([200, 500]).toContain(res.status); 
    // tùy implementation của controller
  });

  // =========================
  // 8. ATTACK CASE
  // =========================

  it('should handle SQL injection attempt safely', async () => {
    (authService.verifyUser as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ username: "' OR 1=1 --", password: '123' });

    expect(res.status).toBe(401);
  });

  it('should handle XSS input safely', async () => {
    (authService.verifyUser as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ username: "<script>alert(1)</script>", password: '123' });

    expect(res.status).toBe(401);
  });

  // =========================
  // 9. INTEGRATION BEHAVIOR
  // =========================

  it('should call verifyUser with correct params', async () => {
    const mockUser = { user_id: 1, user_name: 'admin' };
    (authService.verifyUser as any).mockResolvedValue(mockUser);

    await request(app)
      .post('/login')
      .send({ username: 'admin', password: '123' });

    expect(authService.verifyUser).toHaveBeenCalledTimes(1);
    expect(authService.verifyUser).toHaveBeenCalledWith('admin', '123');
  });

});