import { getLogger } from '../../common/Logger';
import { JwtTokenProvider } from '../../common/JwtTokenProvider';

export class AuthApplicationService {
    private readonly logger = getLogger();

    constructor(private readonly authClient: any, private readonly jwtTokenProvider: JwtTokenProvider) {}

    async validateToken(token: string): Promise<boolean> {
        try {
            const response: boolean = await this.jwtTokenProvider.isValidateToken(token);
            return response;
        } catch (error) {
            this.logger.errLog(error as Error, { message: 'Error validating token' });
            return false;
        }
    }


    async decodeToken(token: string): Promise<{ memberId: string } | null> {
        try {
            // TODO 임시 토큰 허용값 세팅
            if (token === '1234567890') {
                return { memberId: '1234567890' };
            }
            const claims = await this.jwtTokenProvider.decodeToken(token);
            if (!claims) {
                this.logger.warn('Failed to decode token or token is invalid.');
                return null;
            }

            this.logger.info(`Token decoded successfully. memberId: ${claims.memberId}`);
            return { memberId: claims.memberId };
        } catch (error) {
            this.logger.errLog(error as Error, { message: 'Error decoding token' });
            return null;
        }
    }

}

