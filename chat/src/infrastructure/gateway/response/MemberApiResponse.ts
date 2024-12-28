import { MemberInformation } from "../../../application/model/MemberInformation";

export class MemberApiResponse {
    id: number;
    loginId: string | null;
    email: string | null;
    memberProfile: MemberProfileApiResponse;
    memberRole: MemberRoleApiResponse;

    toMemberInformation(): MemberInformation {
        return new MemberInformation(
            this.id,
            this.loginId ?? null,
            this.email ?? null,
            this.memberProfile.nickname,
            this.memberProfile.photo ?? null,
            this.memberProfile.contents ?? null,
            this.memberRole.roleTitle
        );
    }
}

export class MemberProfileApiResponse {
    id: number;
    photo: string | null;
    nickname: string;
    contents: string | null;
}


export class MemberRoleApiResponse {
    id: number;
    roleTitle: string;
}