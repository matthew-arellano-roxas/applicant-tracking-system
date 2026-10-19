export declare const INTERVIEW_RUBRICS: {
    readonly HR_SCREENING: readonly [{
        readonly id: "communication";
        readonly name: "Communication";
        readonly description: "Explains experience clearly, listens carefully, and answers questions directly.";
    }, {
        readonly id: "relevantExperience";
        readonly name: "Relevant experience";
        readonly description: "Connects education or work experience to the school position.";
    }, {
        readonly id: "motivation";
        readonly name: "Motivation";
        readonly description: "Gives a thoughtful reason for applying and understands the role.";
    }, {
        readonly id: "professionalism";
        readonly name: "Professionalism";
        readonly description: "Shows preparation, respect, reliability, and appropriate judgment.";
    }, {
        readonly id: "studentSafetyAwareness";
        readonly name: "Student safety awareness";
        readonly description: "Understands the responsibility to maintain a safe, respectful school environment.";
    }];
    readonly DEPARTMENT: {
        readonly TEACHING: readonly [{
            readonly id: "subjectKnowledge";
            readonly name: "Subject knowledge";
            readonly description: "Demonstrates accurate, relevant knowledge of the subject area.";
        }, {
            readonly id: "curriculumPlanning";
            readonly name: "Curriculum and lesson planning";
            readonly description: "Plans learning aligned with curriculum goals and learner needs.";
        }, {
            readonly id: "instructionalPractice";
            readonly name: "Instructional practice";
            readonly description: "Selects clear, effective teaching strategies and learning activities.";
        }, {
            readonly id: "assessmentPractice";
            readonly name: "Assessment and feedback";
            readonly description: "Checks student understanding and uses fair, useful feedback.";
        }, {
            readonly id: "inclusiveTeaching";
            readonly name: "Inclusive teaching";
            readonly description: "Adapts instruction to support learners with different needs and backgrounds.";
        }];
        readonly NON_TEACHING: readonly [{
            readonly id: "roleKnowledge";
            readonly name: "Role and process knowledge";
            readonly description: "Understands the position’s key duties, procedures, and service standards.";
        }, {
            readonly id: "accuracyOrganization";
            readonly name: "Accuracy and organization";
            readonly description: "Handles records, tasks, and competing priorities carefully and consistently.";
        }, {
            readonly id: "serviceOrientation";
            readonly name: "Service orientation";
            readonly description: "Responds respectfully and helpfully to students, families, and school staff.";
        }, {
            readonly id: "confidentiality";
            readonly name: "Confidentiality and ethics";
            readonly description: "Protects private information and recognizes ethical responsibilities.";
        }, {
            readonly id: "problemSolving";
            readonly name: "Problem solving";
            readonly description: "Uses sound judgment to resolve routine role-related situations.";
        }];
    };
    readonly DEMO_TEACHING: readonly [{
        readonly id: "lessonObjective";
        readonly name: "Learning objective and lesson structure";
        readonly description: "States a clear objective and organizes the lesson coherently.";
    }, {
        readonly id: "subjectAccuracy";
        readonly name: "Subject accuracy";
        readonly description: "Presents accurate content at an appropriate level for the learners.";
    }, {
        readonly id: "explanationAndMethods";
        readonly name: "Explanation and teaching methods";
        readonly description: "Explains ideas clearly and uses effective methods or learning materials.";
    }, {
        readonly id: "engagementAndChecks";
        readonly name: "Engagement and checks for understanding";
        readonly description: "Engages learners and checks whether they understand during the lesson.";
    }, {
        readonly id: "classroomEnvironment";
        readonly name: "Classroom environment";
        readonly description: "Creates an inclusive, respectful, and well-managed learning environment.";
    }];
    readonly FINAL: {
        readonly TEACHING: readonly [{
            readonly id: "educationalJudgment";
            readonly name: "Educational judgment";
            readonly description: "Makes thoughtful decisions about instruction, assessment, and learner needs.";
        }, {
            readonly id: "studentWellbeing";
            readonly name: "Student wellbeing and safeguarding";
            readonly description: "Prioritizes student wellbeing, appropriate boundaries, and safeguarding.";
        }, {
            readonly id: "familyAndColleaguePartnership";
            readonly name: "Partnership with families and colleagues";
            readonly description: "Works constructively with families and the school community.";
        }, {
            readonly id: "schoolMissionAlignment";
            readonly name: "School mission alignment";
            readonly description: "Shows alignment with the school’s educational mission and values.";
        }, {
            readonly id: "readiness";
            readonly name: "Readiness for teaching responsibilities";
            readonly description: "Demonstrates readiness to take responsibility for teaching and learning.";
        }];
        readonly NON_TEACHING: readonly [{
            readonly id: "operationalJudgment";
            readonly name: "Operational judgment";
            readonly description: "Makes sound, timely decisions within the position’s responsibilities.";
        }, {
            readonly id: "integrityAndConfidentiality";
            readonly name: "Integrity and confidentiality";
            readonly description: "Handles sensitive information and responsibilities ethically.";
        }, {
            readonly id: "schoolCommunityService";
            readonly name: "Service to the school community";
            readonly description: "Supports students, families, and staff with respect and care.";
        }, {
            readonly id: "schoolMissionAlignment";
            readonly name: "School mission alignment";
            readonly description: "Shows alignment with the school’s educational mission and values.";
        }, {
            readonly id: "readiness";
            readonly name: "Readiness for role responsibilities";
            readonly description: "Demonstrates readiness to perform the position’s core duties.";
        }];
    };
};
export type InterviewRubricStage = keyof typeof INTERVIEW_RUBRICS;
export type InterviewRubricRoleType = 'TEACHING' | 'NON_TEACHING';
export type InterviewRubricCriterionId = string;
export declare const INTERVIEW_RATING_SCALE: readonly [{
    readonly score: 1;
    readonly label: "Does not meet expectations";
    readonly description: "Little or no supporting evidence.";
}, {
    readonly score: 2;
    readonly label: "Partially meets expectations";
    readonly description: "Some evidence, with notable gaps.";
}, {
    readonly score: 3;
    readonly label: "Meets expectations";
    readonly description: "Adequate evidence for the criterion.";
}, {
    readonly score: 4;
    readonly label: "Strong";
    readonly description: "Consistent evidence above expectations.";
}, {
    readonly score: 5;
    readonly label: "Excellent";
    readonly description: "Exceptional, specific evidence throughout.";
}];
export declare const getInterviewRubricCriteria: (stage: InterviewRubricStage, roleType: InterviewRubricRoleType) => readonly [{
    readonly id: "communication";
    readonly name: "Communication";
    readonly description: "Explains experience clearly, listens carefully, and answers questions directly.";
}, {
    readonly id: "relevantExperience";
    readonly name: "Relevant experience";
    readonly description: "Connects education or work experience to the school position.";
}, {
    readonly id: "motivation";
    readonly name: "Motivation";
    readonly description: "Gives a thoughtful reason for applying and understands the role.";
}, {
    readonly id: "professionalism";
    readonly name: "Professionalism";
    readonly description: "Shows preparation, respect, reliability, and appropriate judgment.";
}, {
    readonly id: "studentSafetyAwareness";
    readonly name: "Student safety awareness";
    readonly description: "Understands the responsibility to maintain a safe, respectful school environment.";
}] | readonly [{
    readonly id: "subjectKnowledge";
    readonly name: "Subject knowledge";
    readonly description: "Demonstrates accurate, relevant knowledge of the subject area.";
}, {
    readonly id: "curriculumPlanning";
    readonly name: "Curriculum and lesson planning";
    readonly description: "Plans learning aligned with curriculum goals and learner needs.";
}, {
    readonly id: "instructionalPractice";
    readonly name: "Instructional practice";
    readonly description: "Selects clear, effective teaching strategies and learning activities.";
}, {
    readonly id: "assessmentPractice";
    readonly name: "Assessment and feedback";
    readonly description: "Checks student understanding and uses fair, useful feedback.";
}, {
    readonly id: "inclusiveTeaching";
    readonly name: "Inclusive teaching";
    readonly description: "Adapts instruction to support learners with different needs and backgrounds.";
}] | readonly [{
    readonly id: "roleKnowledge";
    readonly name: "Role and process knowledge";
    readonly description: "Understands the position’s key duties, procedures, and service standards.";
}, {
    readonly id: "accuracyOrganization";
    readonly name: "Accuracy and organization";
    readonly description: "Handles records, tasks, and competing priorities carefully and consistently.";
}, {
    readonly id: "serviceOrientation";
    readonly name: "Service orientation";
    readonly description: "Responds respectfully and helpfully to students, families, and school staff.";
}, {
    readonly id: "confidentiality";
    readonly name: "Confidentiality and ethics";
    readonly description: "Protects private information and recognizes ethical responsibilities.";
}, {
    readonly id: "problemSolving";
    readonly name: "Problem solving";
    readonly description: "Uses sound judgment to resolve routine role-related situations.";
}] | readonly [{
    readonly id: "lessonObjective";
    readonly name: "Learning objective and lesson structure";
    readonly description: "States a clear objective and organizes the lesson coherently.";
}, {
    readonly id: "subjectAccuracy";
    readonly name: "Subject accuracy";
    readonly description: "Presents accurate content at an appropriate level for the learners.";
}, {
    readonly id: "explanationAndMethods";
    readonly name: "Explanation and teaching methods";
    readonly description: "Explains ideas clearly and uses effective methods or learning materials.";
}, {
    readonly id: "engagementAndChecks";
    readonly name: "Engagement and checks for understanding";
    readonly description: "Engages learners and checks whether they understand during the lesson.";
}, {
    readonly id: "classroomEnvironment";
    readonly name: "Classroom environment";
    readonly description: "Creates an inclusive, respectful, and well-managed learning environment.";
}] | readonly [{
    readonly id: "educationalJudgment";
    readonly name: "Educational judgment";
    readonly description: "Makes thoughtful decisions about instruction, assessment, and learner needs.";
}, {
    readonly id: "studentWellbeing";
    readonly name: "Student wellbeing and safeguarding";
    readonly description: "Prioritizes student wellbeing, appropriate boundaries, and safeguarding.";
}, {
    readonly id: "familyAndColleaguePartnership";
    readonly name: "Partnership with families and colleagues";
    readonly description: "Works constructively with families and the school community.";
}, {
    readonly id: "schoolMissionAlignment";
    readonly name: "School mission alignment";
    readonly description: "Shows alignment with the school’s educational mission and values.";
}, {
    readonly id: "readiness";
    readonly name: "Readiness for teaching responsibilities";
    readonly description: "Demonstrates readiness to take responsibility for teaching and learning.";
}] | readonly [{
    readonly id: "operationalJudgment";
    readonly name: "Operational judgment";
    readonly description: "Makes sound, timely decisions within the position’s responsibilities.";
}, {
    readonly id: "integrityAndConfidentiality";
    readonly name: "Integrity and confidentiality";
    readonly description: "Handles sensitive information and responsibilities ethically.";
}, {
    readonly id: "schoolCommunityService";
    readonly name: "Service to the school community";
    readonly description: "Supports students, families, and staff with respect and care.";
}, {
    readonly id: "schoolMissionAlignment";
    readonly name: "School mission alignment";
    readonly description: "Shows alignment with the school’s educational mission and values.";
}, {
    readonly id: "readiness";
    readonly name: "Readiness for role responsibilities";
    readonly description: "Demonstrates readiness to perform the position’s core duties.";
}];
export declare const getInterviewRubric: (stage?: InterviewRubricStage, roleType?: InterviewRubricRoleType) => {
    stage: "HR_SCREENING" | "DEPARTMENT" | "DEMO_TEACHING" | "FINAL";
    roleType: string;
    criteria: readonly [{
        readonly id: "communication";
        readonly name: "Communication";
        readonly description: "Explains experience clearly, listens carefully, and answers questions directly.";
    }, {
        readonly id: "relevantExperience";
        readonly name: "Relevant experience";
        readonly description: "Connects education or work experience to the school position.";
    }, {
        readonly id: "motivation";
        readonly name: "Motivation";
        readonly description: "Gives a thoughtful reason for applying and understands the role.";
    }, {
        readonly id: "professionalism";
        readonly name: "Professionalism";
        readonly description: "Shows preparation, respect, reliability, and appropriate judgment.";
    }, {
        readonly id: "studentSafetyAwareness";
        readonly name: "Student safety awareness";
        readonly description: "Understands the responsibility to maintain a safe, respectful school environment.";
    }] | readonly [{
        readonly id: "subjectKnowledge";
        readonly name: "Subject knowledge";
        readonly description: "Demonstrates accurate, relevant knowledge of the subject area.";
    }, {
        readonly id: "curriculumPlanning";
        readonly name: "Curriculum and lesson planning";
        readonly description: "Plans learning aligned with curriculum goals and learner needs.";
    }, {
        readonly id: "instructionalPractice";
        readonly name: "Instructional practice";
        readonly description: "Selects clear, effective teaching strategies and learning activities.";
    }, {
        readonly id: "assessmentPractice";
        readonly name: "Assessment and feedback";
        readonly description: "Checks student understanding and uses fair, useful feedback.";
    }, {
        readonly id: "inclusiveTeaching";
        readonly name: "Inclusive teaching";
        readonly description: "Adapts instruction to support learners with different needs and backgrounds.";
    }] | readonly [{
        readonly id: "roleKnowledge";
        readonly name: "Role and process knowledge";
        readonly description: "Understands the position’s key duties, procedures, and service standards.";
    }, {
        readonly id: "accuracyOrganization";
        readonly name: "Accuracy and organization";
        readonly description: "Handles records, tasks, and competing priorities carefully and consistently.";
    }, {
        readonly id: "serviceOrientation";
        readonly name: "Service orientation";
        readonly description: "Responds respectfully and helpfully to students, families, and school staff.";
    }, {
        readonly id: "confidentiality";
        readonly name: "Confidentiality and ethics";
        readonly description: "Protects private information and recognizes ethical responsibilities.";
    }, {
        readonly id: "problemSolving";
        readonly name: "Problem solving";
        readonly description: "Uses sound judgment to resolve routine role-related situations.";
    }] | readonly [{
        readonly id: "lessonObjective";
        readonly name: "Learning objective and lesson structure";
        readonly description: "States a clear objective and organizes the lesson coherently.";
    }, {
        readonly id: "subjectAccuracy";
        readonly name: "Subject accuracy";
        readonly description: "Presents accurate content at an appropriate level for the learners.";
    }, {
        readonly id: "explanationAndMethods";
        readonly name: "Explanation and teaching methods";
        readonly description: "Explains ideas clearly and uses effective methods or learning materials.";
    }, {
        readonly id: "engagementAndChecks";
        readonly name: "Engagement and checks for understanding";
        readonly description: "Engages learners and checks whether they understand during the lesson.";
    }, {
        readonly id: "classroomEnvironment";
        readonly name: "Classroom environment";
        readonly description: "Creates an inclusive, respectful, and well-managed learning environment.";
    }] | readonly [{
        readonly id: "educationalJudgment";
        readonly name: "Educational judgment";
        readonly description: "Makes thoughtful decisions about instruction, assessment, and learner needs.";
    }, {
        readonly id: "studentWellbeing";
        readonly name: "Student wellbeing and safeguarding";
        readonly description: "Prioritizes student wellbeing, appropriate boundaries, and safeguarding.";
    }, {
        readonly id: "familyAndColleaguePartnership";
        readonly name: "Partnership with families and colleagues";
        readonly description: "Works constructively with families and the school community.";
    }, {
        readonly id: "schoolMissionAlignment";
        readonly name: "School mission alignment";
        readonly description: "Shows alignment with the school’s educational mission and values.";
    }, {
        readonly id: "readiness";
        readonly name: "Readiness for teaching responsibilities";
        readonly description: "Demonstrates readiness to take responsibility for teaching and learning.";
    }] | readonly [{
        readonly id: "operationalJudgment";
        readonly name: "Operational judgment";
        readonly description: "Makes sound, timely decisions within the position’s responsibilities.";
    }, {
        readonly id: "integrityAndConfidentiality";
        readonly name: "Integrity and confidentiality";
        readonly description: "Handles sensitive information and responsibilities ethically.";
    }, {
        readonly id: "schoolCommunityService";
        readonly name: "Service to the school community";
        readonly description: "Supports students, families, and staff with respect and care.";
    }, {
        readonly id: "schoolMissionAlignment";
        readonly name: "School mission alignment";
        readonly description: "Shows alignment with the school’s educational mission and values.";
    }, {
        readonly id: "readiness";
        readonly name: "Readiness for role responsibilities";
        readonly description: "Demonstrates readiness to perform the position’s core duties.";
    }];
    ratingScale: readonly [{
        readonly score: 1;
        readonly label: "Does not meet expectations";
        readonly description: "Little or no supporting evidence.";
    }, {
        readonly score: 2;
        readonly label: "Partially meets expectations";
        readonly description: "Some evidence, with notable gaps.";
    }, {
        readonly score: 3;
        readonly label: "Meets expectations";
        readonly description: "Adequate evidence for the criterion.";
    }, {
        readonly score: 4;
        readonly label: "Strong";
        readonly description: "Consistent evidence above expectations.";
    }, {
        readonly score: 5;
        readonly label: "Excellent";
        readonly description: "Exceptional, specific evidence throughout.";
    }];
    rubrics?: undefined;
} | {
    stage: "DEPARTMENT" | "FINAL";
    rubrics: {
        roleType: string;
        criteria: any;
    }[];
    ratingScale: readonly [{
        readonly score: 1;
        readonly label: "Does not meet expectations";
        readonly description: "Little or no supporting evidence.";
    }, {
        readonly score: 2;
        readonly label: "Partially meets expectations";
        readonly description: "Some evidence, with notable gaps.";
    }, {
        readonly score: 3;
        readonly label: "Meets expectations";
        readonly description: "Adequate evidence for the criterion.";
    }, {
        readonly score: 4;
        readonly label: "Strong";
        readonly description: "Consistent evidence above expectations.";
    }, {
        readonly score: 5;
        readonly label: "Excellent";
        readonly description: "Exceptional, specific evidence throughout.";
    }];
    roleType?: undefined;
    criteria?: undefined;
} | {
    ratingScale: readonly [{
        readonly score: 1;
        readonly label: "Does not meet expectations";
        readonly description: "Little or no supporting evidence.";
    }, {
        readonly score: 2;
        readonly label: "Partially meets expectations";
        readonly description: "Some evidence, with notable gaps.";
    }, {
        readonly score: 3;
        readonly label: "Meets expectations";
        readonly description: "Adequate evidence for the criterion.";
    }, {
        readonly score: 4;
        readonly label: "Strong";
        readonly description: "Consistent evidence above expectations.";
    }, {
        readonly score: 5;
        readonly label: "Excellent";
        readonly description: "Exceptional, specific evidence throughout.";
    }];
    rubrics: ({
        stage: "DEPARTMENT" | "FINAL";
        roleType: "TEACHING" | "NON_TEACHING";
        criteria: readonly [{
            readonly id: "subjectKnowledge";
            readonly name: "Subject knowledge";
            readonly description: "Demonstrates accurate, relevant knowledge of the subject area.";
        }, {
            readonly id: "curriculumPlanning";
            readonly name: "Curriculum and lesson planning";
            readonly description: "Plans learning aligned with curriculum goals and learner needs.";
        }, {
            readonly id: "instructionalPractice";
            readonly name: "Instructional practice";
            readonly description: "Selects clear, effective teaching strategies and learning activities.";
        }, {
            readonly id: "assessmentPractice";
            readonly name: "Assessment and feedback";
            readonly description: "Checks student understanding and uses fair, useful feedback.";
        }, {
            readonly id: "inclusiveTeaching";
            readonly name: "Inclusive teaching";
            readonly description: "Adapts instruction to support learners with different needs and backgrounds.";
        }] | readonly [{
            readonly id: "roleKnowledge";
            readonly name: "Role and process knowledge";
            readonly description: "Understands the position’s key duties, procedures, and service standards.";
        }, {
            readonly id: "accuracyOrganization";
            readonly name: "Accuracy and organization";
            readonly description: "Handles records, tasks, and competing priorities carefully and consistently.";
        }, {
            readonly id: "serviceOrientation";
            readonly name: "Service orientation";
            readonly description: "Responds respectfully and helpfully to students, families, and school staff.";
        }, {
            readonly id: "confidentiality";
            readonly name: "Confidentiality and ethics";
            readonly description: "Protects private information and recognizes ethical responsibilities.";
        }, {
            readonly id: "problemSolving";
            readonly name: "Problem solving";
            readonly description: "Uses sound judgment to resolve routine role-related situations.";
        }] | readonly [{
            readonly id: "educationalJudgment";
            readonly name: "Educational judgment";
            readonly description: "Makes thoughtful decisions about instruction, assessment, and learner needs.";
        }, {
            readonly id: "studentWellbeing";
            readonly name: "Student wellbeing and safeguarding";
            readonly description: "Prioritizes student wellbeing, appropriate boundaries, and safeguarding.";
        }, {
            readonly id: "familyAndColleaguePartnership";
            readonly name: "Partnership with families and colleagues";
            readonly description: "Works constructively with families and the school community.";
        }, {
            readonly id: "schoolMissionAlignment";
            readonly name: "School mission alignment";
            readonly description: "Shows alignment with the school’s educational mission and values.";
        }, {
            readonly id: "readiness";
            readonly name: "Readiness for teaching responsibilities";
            readonly description: "Demonstrates readiness to take responsibility for teaching and learning.";
        }] | readonly [{
            readonly id: "operationalJudgment";
            readonly name: "Operational judgment";
            readonly description: "Makes sound, timely decisions within the position’s responsibilities.";
        }, {
            readonly id: "integrityAndConfidentiality";
            readonly name: "Integrity and confidentiality";
            readonly description: "Handles sensitive information and responsibilities ethically.";
        }, {
            readonly id: "schoolCommunityService";
            readonly name: "Service to the school community";
            readonly description: "Supports students, families, and staff with respect and care.";
        }, {
            readonly id: "schoolMissionAlignment";
            readonly name: "School mission alignment";
            readonly description: "Shows alignment with the school’s educational mission and values.";
        }, {
            readonly id: "readiness";
            readonly name: "Readiness for role responsibilities";
            readonly description: "Demonstrates readiness to perform the position’s core duties.";
        }];
    } | {
        stage: string;
        roleType: string;
        criteria: readonly [{
            readonly id: "communication";
            readonly name: "Communication";
            readonly description: "Explains experience clearly, listens carefully, and answers questions directly.";
        }, {
            readonly id: "relevantExperience";
            readonly name: "Relevant experience";
            readonly description: "Connects education or work experience to the school position.";
        }, {
            readonly id: "motivation";
            readonly name: "Motivation";
            readonly description: "Gives a thoughtful reason for applying and understands the role.";
        }, {
            readonly id: "professionalism";
            readonly name: "Professionalism";
            readonly description: "Shows preparation, respect, reliability, and appropriate judgment.";
        }, {
            readonly id: "studentSafetyAwareness";
            readonly name: "Student safety awareness";
            readonly description: "Understands the responsibility to maintain a safe, respectful school environment.";
        }];
    } | {
        stage: string;
        roleType: string;
        criteria: readonly [{
            readonly id: "lessonObjective";
            readonly name: "Learning objective and lesson structure";
            readonly description: "States a clear objective and organizes the lesson coherently.";
        }, {
            readonly id: "subjectAccuracy";
            readonly name: "Subject accuracy";
            readonly description: "Presents accurate content at an appropriate level for the learners.";
        }, {
            readonly id: "explanationAndMethods";
            readonly name: "Explanation and teaching methods";
            readonly description: "Explains ideas clearly and uses effective methods or learning materials.";
        }, {
            readonly id: "engagementAndChecks";
            readonly name: "Engagement and checks for understanding";
            readonly description: "Engages learners and checks whether they understand during the lesson.";
        }, {
            readonly id: "classroomEnvironment";
            readonly name: "Classroom environment";
            readonly description: "Creates an inclusive, respectful, and well-managed learning environment.";
        }];
    })[];
    stage?: undefined;
    roleType?: undefined;
    criteria?: undefined;
};
