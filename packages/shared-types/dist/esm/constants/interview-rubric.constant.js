export const INTERVIEW_RUBRICS = {
    HR_SCREENING: [
        {
            id: 'communication',
            name: 'Communication',
            description: 'Explains experience clearly, listens carefully, and answers questions directly.',
        },
        {
            id: 'relevantExperience',
            name: 'Relevant experience',
            description: 'Connects education or work experience to the school position.',
        },
        {
            id: 'motivation',
            name: 'Motivation',
            description: 'Gives a thoughtful reason for applying and understands the role.',
        },
        {
            id: 'professionalism',
            name: 'Professionalism',
            description: 'Shows preparation, respect, reliability, and appropriate judgment.',
        },
        {
            id: 'studentSafetyAwareness',
            name: 'Student safety awareness',
            description: 'Understands the responsibility to maintain a safe, respectful school environment.',
        },
    ],
    DEPARTMENT: {
        TEACHING: [
            {
                id: 'subjectKnowledge',
                name: 'Subject knowledge',
                description: 'Demonstrates accurate, relevant knowledge of the subject area.',
            },
            {
                id: 'curriculumPlanning',
                name: 'Curriculum and lesson planning',
                description: 'Plans learning aligned with curriculum goals and learner needs.',
            },
            {
                id: 'instructionalPractice',
                name: 'Instructional practice',
                description: 'Selects clear, effective teaching strategies and learning activities.',
            },
            {
                id: 'assessmentPractice',
                name: 'Assessment and feedback',
                description: 'Checks student understanding and uses fair, useful feedback.',
            },
            {
                id: 'inclusiveTeaching',
                name: 'Inclusive teaching',
                description: 'Adapts instruction to support learners with different needs and backgrounds.',
            },
        ],
        NON_TEACHING: [
            {
                id: 'roleKnowledge',
                name: 'Role and process knowledge',
                description: 'Understands the position’s key duties, procedures, and service standards.',
            },
            {
                id: 'accuracyOrganization',
                name: 'Accuracy and organization',
                description: 'Handles records, tasks, and competing priorities carefully and consistently.',
            },
            {
                id: 'serviceOrientation',
                name: 'Service orientation',
                description: 'Responds respectfully and helpfully to students, families, and school staff.',
            },
            {
                id: 'confidentiality',
                name: 'Confidentiality and ethics',
                description: 'Protects private information and recognizes ethical responsibilities.',
            },
            {
                id: 'problemSolving',
                name: 'Problem solving',
                description: 'Uses sound judgment to resolve routine role-related situations.',
            },
        ],
    },
    DEMO_TEACHING: [
        {
            id: 'lessonObjective',
            name: 'Learning objective and lesson structure',
            description: 'States a clear objective and organizes the lesson coherently.',
        },
        {
            id: 'subjectAccuracy',
            name: 'Subject accuracy',
            description: 'Presents accurate content at an appropriate level for the learners.',
        },
        {
            id: 'explanationAndMethods',
            name: 'Explanation and teaching methods',
            description: 'Explains ideas clearly and uses effective methods or learning materials.',
        },
        {
            id: 'engagementAndChecks',
            name: 'Engagement and checks for understanding',
            description: 'Engages learners and checks whether they understand during the lesson.',
        },
        {
            id: 'classroomEnvironment',
            name: 'Classroom environment',
            description: 'Creates an inclusive, respectful, and well-managed learning environment.',
        },
    ],
    FINAL: {
        TEACHING: [
            {
                id: 'educationalJudgment',
                name: 'Educational judgment',
                description: 'Makes thoughtful decisions about instruction, assessment, and learner needs.',
            },
            {
                id: 'studentWellbeing',
                name: 'Student wellbeing and safeguarding',
                description: 'Prioritizes student wellbeing, appropriate boundaries, and safeguarding.',
            },
            {
                id: 'familyAndColleaguePartnership',
                name: 'Partnership with families and colleagues',
                description: 'Works constructively with families and the school community.',
            },
            {
                id: 'schoolMissionAlignment',
                name: 'School mission alignment',
                description: 'Shows alignment with the school’s educational mission and values.',
            },
            {
                id: 'readiness',
                name: 'Readiness for teaching responsibilities',
                description: 'Demonstrates readiness to take responsibility for teaching and learning.',
            },
        ],
        NON_TEACHING: [
            {
                id: 'operationalJudgment',
                name: 'Operational judgment',
                description: 'Makes sound, timely decisions within the position’s responsibilities.',
            },
            {
                id: 'integrityAndConfidentiality',
                name: 'Integrity and confidentiality',
                description: 'Handles sensitive information and responsibilities ethically.',
            },
            {
                id: 'schoolCommunityService',
                name: 'Service to the school community',
                description: 'Supports students, families, and staff with respect and care.',
            },
            {
                id: 'schoolMissionAlignment',
                name: 'School mission alignment',
                description: 'Shows alignment with the school’s educational mission and values.',
            },
            {
                id: 'readiness',
                name: 'Readiness for role responsibilities',
                description: 'Demonstrates readiness to perform the position’s core duties.',
            },
        ],
    },
};
export const INTERVIEW_RATING_SCALE = [
    {
        score: 1,
        label: 'Does not meet expectations',
        description: 'Little or no supporting evidence.',
    },
    {
        score: 2,
        label: 'Partially meets expectations',
        description: 'Some evidence, with notable gaps.',
    },
    { score: 3, label: 'Meets expectations', description: 'Adequate evidence for the criterion.' },
    { score: 4, label: 'Strong', description: 'Consistent evidence above expectations.' },
    { score: 5, label: 'Excellent', description: 'Exceptional, specific evidence throughout.' },
];
export const getInterviewRubricCriteria = (stage, roleType) => {
    if (stage === 'HR_SCREENING')
        return INTERVIEW_RUBRICS.HR_SCREENING;
    if (stage === 'DEMO_TEACHING')
        return INTERVIEW_RUBRICS.DEMO_TEACHING;
    return INTERVIEW_RUBRICS[stage][roleType];
};
export const getInterviewRubric = (stage, roleType) => {
    if (stage && roleType) {
        return {
            stage,
            roleType: stage === 'HR_SCREENING' ? 'ALL' : roleType,
            criteria: getInterviewRubricCriteria(stage, roleType),
            ratingScale: INTERVIEW_RATING_SCALE,
        };
    }
    if (stage === 'HR_SCREENING') {
        return {
            stage,
            roleType: 'ALL',
            criteria: INTERVIEW_RUBRICS.HR_SCREENING,
            ratingScale: INTERVIEW_RATING_SCALE,
        };
    }
    if (stage === 'DEMO_TEACHING') {
        return {
            stage,
            roleType: 'TEACHING',
            criteria: INTERVIEW_RUBRICS.DEMO_TEACHING,
            ratingScale: INTERVIEW_RATING_SCALE,
        };
    }
    if (stage) {
        return {
            stage,
            rubrics: Object.entries(INTERVIEW_RUBRICS[stage]).map(([type, criteria]) => ({
                roleType: type,
                criteria,
            })),
            ratingScale: INTERVIEW_RATING_SCALE,
        };
    }
    return {
        ratingScale: INTERVIEW_RATING_SCALE,
        rubrics: [
            { stage: 'HR_SCREENING', roleType: 'ALL', criteria: INTERVIEW_RUBRICS.HR_SCREENING },
            ...['DEPARTMENT', 'FINAL'].flatMap((rubricStage) => ['TEACHING', 'NON_TEACHING'].map((type) => ({
                stage: rubricStage,
                roleType: type,
                criteria: INTERVIEW_RUBRICS[rubricStage][type],
            }))),
            { stage: 'DEMO_TEACHING', roleType: 'TEACHING', criteria: INTERVIEW_RUBRICS.DEMO_TEACHING },
        ],
    };
};
