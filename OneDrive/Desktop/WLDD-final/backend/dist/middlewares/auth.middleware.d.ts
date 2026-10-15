import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: 'brand' | 'creator';
    };
}
export declare const verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireRole: (role: 'brand' | 'creator') => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map