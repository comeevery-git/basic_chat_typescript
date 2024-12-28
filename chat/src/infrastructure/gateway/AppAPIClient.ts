import { MemberInformation } from '../../application/model/MemberInformation';
import { HttpClient } from '../../common/HttpClient';
import { IMemberRepository } from '../../domain/repository/IMemberRepository';
import { MemberApiResponse } from './response/MemberApiResponse';
import { getLogger } from '../../common/Logger';

export class AppAPIClient implements IMemberRepository {
    private readonly http: HttpClient;
    private readonly version = '/api/v1';
    private readonly logger = getLogger();

    constructor(baseUrl: string) {
        this.http = new HttpClient(baseUrl + this.version);
    }

    async getMemberById(memberId: string): Promise<MemberInformation> {
        try {
            const response = await this.http.get<{ code: number; message: string; now: string; data: any }>(`/members/${memberId}`);
            const data = response.data;

            const memberApiResponse = new MemberApiResponse();
            Object.assign(memberApiResponse, data);

            return memberApiResponse.toMemberInformation();
        } catch (error) {
            this.logger.errLog(error as Error, {
                message: 'Error in getMemberById',
                routeName: `/members/${memberId}`
            });
            throw error;
        }
    }
}
