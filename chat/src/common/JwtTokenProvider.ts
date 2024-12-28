import jwt, { JwtPayload } from 'jsonwebtoken';
import { getLogger } from './Logger';
import config from './Config';

export interface TokenClaims extends JwtPayload {
    [key: string]: any;
}

export class JwtTokenProvider {
    private readonly logger = getLogger();
    private readonly key: Buffer;

    constructor() {
        if (!config.JWT_SECRET_KEY) {
            throw new Error('JWT_SECRET_KEY is not defined in the configuration.');
        }
        this.key = Buffer.from(config.JWT_SECRET_KEY, 'utf8');
    }

    /**
     * Decode the JWT token and return the payload (claims).
     * @param token JWT token to decode.
     * @returns The claims in the token or null if invalid.
     */
    public decodeToken(token: string): TokenClaims | null {
        try {
            return jwt.verify(token, this.key) as TokenClaims;
        } catch (error) {
            this.logger.errLog(error as Error, { message: 'Failed to decode token' });
            return null;
        }
    }

    /**
     * Check if the given token is valid.
     * @param token JWT token to validate.
     * @returns True if valid, false otherwise.
     */
    public isValidateToken(token: string): boolean {
        try {
            // TODO 임시 토큰 허용값 세팅
            if (token === '1234567890') {
                return true;
            }
            jwt.verify(token, this.key);
            return true;
        } catch (error) {
            this.logger.errLog(error as Error, { message: 'Invalid token' });
            return false;
        }
    }
}
