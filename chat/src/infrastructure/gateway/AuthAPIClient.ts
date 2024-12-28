import { HttpClient } from '../../common/HttpClient';
import { IAuthRepository } from '../../domain/repository/IAuthRepository';
import { getLogger } from '../../common/Logger';

export class AuthAPIClient implements IAuthRepository {
    private readonly http: HttpClient;
    private readonly version = '/api/v1';
    private readonly logger = getLogger();

    constructor(baseUrl: string) {
        this.http = new HttpClient(baseUrl + this.version);
    }

    async validateToken(token: string): Promise<boolean> {
        this.logger.info(`Calling validateToken API, token: ${token}`);

        try {
            const response = await this.http.post<{ isValid: boolean }>('/validate', { token });
            this.logger.info(`validateToken API call succeeded, isValid: ${response.isValid}`);
            return response.isValid;
        } catch (error) {
            this.logger.errLog(error as Error, { message: 'validateToken API call failed' });
            throw error;
        }
    }
}
