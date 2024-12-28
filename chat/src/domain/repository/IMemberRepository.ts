import { MemberInformation } from '../../application/model/MemberInformation';

export interface IMemberRepository {
    getMemberById(memberId: string): Promise<MemberInformation>;
}
