import { MemberInformation } from '../model/MemberInformation';
import { IMemberRepository } from '../../domain/repository/IMemberRepository';
import { getLogger } from '../../common/Logger';

export class MemberApplicationService {
    private readonly logger = getLogger();
    constructor(private readonly memberRepo: IMemberRepository) {}

    async handleGetMemberInfo(memberId: string): Promise<MemberInformation> {
        try {
            return await this.memberRepo.getMemberById(memberId);
        } catch (error) {
            this.logger.errLog(error as Error, {
                message: 'handle get member info Error.',
                routeName: 'root'
            });
            throw error;
        }
    }

}
