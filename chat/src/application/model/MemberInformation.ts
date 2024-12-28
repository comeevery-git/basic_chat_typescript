export class MemberInformation {
    id: number;
    loginId: string | null;
    email: string | null;
    nickname: string;
    photo: string | null;
    contents: string | null;
    roleTitle: string;

    constructor(
        id: number,
        loginId: string | null,
        email: string | null,
        nickname: string,
        photo: string | null,
        contents: string | null,
        roleTitle: string
    ) {
        this.id = id;
        this.loginId = loginId;
        this.email = email;
        this.nickname = nickname;
        this.photo = photo;
        this.contents = contents;
        this.roleTitle = roleTitle;
    }

}
