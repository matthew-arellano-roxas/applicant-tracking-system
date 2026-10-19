export declare const UserRole: {
    readonly Admin: "ADMIN";
    readonly DepartmentHead: "DEPARTMENT_HEAD";
    readonly Dean: "DEAN";
    readonly Hr: "HUMAN_RESOURCE";
    readonly Applicant: "APPLICANT";
    readonly Employee: "EMPLOYEE";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
