import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth.js';

export const verifyToken = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized: No active session' });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role || 'Tenant',
      name: session.user.name,
      photo: session.user.photo || session.user.image || ''
    };
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Auth middleware error', error: error.message });
  }
};

export const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};
