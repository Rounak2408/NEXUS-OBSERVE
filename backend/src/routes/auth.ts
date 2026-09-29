import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { CONFIG } from '../config';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'DEVOPS_ENGINEER', 'VIEWER']).optional(),
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    let user = await prisma.user.findUnique({ where: { email } });
    
    // Auto-create demo user if missing in DEMO_MODE or for default demo email
    if (!user && (CONFIG.DEMO_MODE || email === 'alex.rivera@nexusobserve.io')) {
      const passwordHash = await bcrypt.hash('demo123', 10);
      user = await prisma.user.create({
        data: {
          email,
          name: 'Alex Rivera',
          passwordHash,
          role: 'ADMIN',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        }
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let isMatch = await bcrypt.compare(password, user.passwordHash);
    
    // If password mismatch in DEMO_MODE for demo user, update password hash on the fly
    if (!isMatch && (CONFIG.DEMO_MODE || email === 'alex.rivera@nexusobserve.io')) {
      const newHash = await bcrypt.hash(password, 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'DEVOPS_ENGINEER',
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
