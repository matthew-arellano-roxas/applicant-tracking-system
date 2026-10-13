# Applicant Tracking System for Bestlink College of the Philippines

> A centralized platform for managing the recruitment of teaching and non-teaching personnel, from staffing request to department assignment.

**Course:** Software Development (Project-Based Elective 3)
**Instructor:** Engr. Patricia Praxedes A. Gloria
**Program:** 4th Year, Computer Engineering
**Institution:** College of Computer Studies, Computer Engineering Department, Bestlink College of the Philippines

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Recruitment Workflow](#recruitment-workflow)
- [User Roles and Features](#user-roles-and-features)
- [System Design](#system-design)
- [Object-Oriented Concepts](#object-oriented-concepts)
- [Project Documentation](#project-documentation)
- [Recommendations and Future Improvements](#recommendations-and-future-improvements)
- [Development Team](#development-team)

---

## Overview

Recruiting teaching and non-teaching personnel involves many steps: identifying staffing needs, reviewing staffing requests, posting job openings, screening applicants, conducting interviews, making hiring decisions, and assigning new hires to departments. When these steps are handled manually or in separate systems, tracking applicants and keeping their information organized becomes difficult.

The **Applicant Tracking System (ATS)** for Bestlink College of the Philippines centralizes and simplifies this process. It gives HR, Department Heads, the Dean, applicants, and administrators a single platform to manage and monitor recruitment from the first staffing request to the final hiring and department assignment.

## Problem Statement

Without a centralized system, the recruitment process suffers from the following:

| Cause                                       | Effect                                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| Separate or manual applicant records        | Applicant information is hard to organize and retrieve                             |
| Multiple recruitment stages                 | Hard to determine an applicant's current status                                    |
| Multiple personnel involved                 | Information must be coordinated between HR, Department Heads, the Dean, and others |
| Large number of applicants                  | Manual review of candidates takes significant time and effort                      |
| Lack of centralized recruitment information | HR, Department Heads, and the Dean struggle to monitor the overall process         |
| Repeated encoding of employee information   | Data must be re-entered when an applicant becomes an employee                      |

## Objectives

- Provide a centralized platform for staffing requests, job postings, applicant data, screening results, application statuses, interview records, hiring recommendations, and employee records.
- Support an approval workflow between Department Heads, the Dean, and HR.
- Help identify potentially qualified applicants through an initial screening feature, while leaving the final selection to authorized personnel.
- Reduce repeated data entry by creating or updating employee records once an applicant is hired.
- Give applicants a way to view openings, apply online, and monitor their application status.

## Recruitment Workflow

```
Staffing Request → Dean Approval → Job Posting → Application → Initial Screening
→ Candidate Selection → Interview & Evaluation → Hiring Recommendation
→ Dean Approval → Employee Record & Department Assignment
```

1. **Staffing request**: A Department Head identifies the need for additional personnel and submits a request.
2. **Dean approval**: The Dean reviews and approves the request, then forwards it to HR.
3. **Job posting**: HR creates and publishes a posting with the position requirements.
4. **Application**: Applicants browse openings and submit applications online.
5. **Initial screening**: The system evaluates applicants against the position's qualifications to flag potential matches.
6. **Candidate selection**: The Department Head reviews screened applicants and selects who proceeds to interview.
7. **Interview and evaluation**: Interview and evaluation details are recorded against the application.
8. **Hiring recommendation**: The Department Head submits a recommendation, which the Dean reviews before the final decision.
9. **Employee record and assignment**: Once accepted, the system creates or updates the employee record and assigns the hire to a department.

## User Roles and Features

### Applicant

- Create an account and manage personal information
- View available job openings
- Submit applications
- Monitor application status

### Human Resources (HR)

- Manage staffing requests
- Create and manage job postings
- View applications and screen applicants
- Update application statuses
- Manage employee records

### Department Head

- Submit staffing requests
- Review qualified applicants and select candidates
- Participate in interviews and provide candidate evaluations
- Submit hiring recommendations

### Dean

- Review and approve or reject staffing requests
- Review and approve or reject hiring recommendations

### Administrator

- Manage users and roles
- Manage departments
- Configure system settings

## System Design

The project documentation includes the following analysis and design artifacts:

- **Cause and Effect Analysis**: Fishbone diagram using the 6Ms
- **Project Schedule**: Four-week schedule and network layout
- **PERT**: Activity sequence, dependencies, and expected durations (planning, requirements gathering, system analysis, system design, database design, development, testing, debugging, documentation, final evaluation)
- **Functional Analysis**: Use case diagram, context diagram, data flow diagram, class diagram, and system flow diagram
- **Object-Oriented Design**: Classes for users, applicants, employees, HR, Department Heads, the Dean, administrators, departments, staffing requests, job postings, applications, screening, interviews, evaluations, and hiring recommendations

## Object-Oriented Concepts

| Principle         | Application in the system                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Encapsulation** | Applicant data and application-related functions are kept inside their own classes                                                              |
| **Inheritance**   | Applicant, HR, Department Head, Dean, and Admin inherit shared properties (user ID, name, email, login) from a base `User` class                |
| **Polymorphism**  | Each role performs actions suited to its responsibility, e.g. a Department Head submits recommendations while the Dean approves or rejects them |
| **Abstraction**   | Users only see the functions relevant to their role, hiding implementation details                                                              |

## Project Documentation

The full project paper covers:

1. Brief Description (background, respondents, interview guidelines)
2. Cause and Effect Analysis
3. Project Schedule
4. Program Evaluation Review Technique (PERT)
5. Functional Analysis
6. Object-Oriented Design
7. Object-Oriented Programming
8. Conclusion and Recommendation
9. Biography

## Recommendations and Future Improvements

- Automated notifications
- Advanced applicant filtering
- Interview scheduling
- Application history
- Recruitment reports
- Improved security
- Regular maintenance and updates based on feedback from HR, Department Heads, the Dean, applicants, and other users

## Development Team

| Name                     | Role / Contribution           |
| ------------------------ | ----------------------------- |
| Matthew A. Roxas         | Main Developer, system design |
| John Mark V. Duran       | Team lead                     |
| Shane Vincent L. Botona  | Paper management              |
| Kenth Jairrus M. Omanita | Diagrams                      |
| Mark Ranjay Solaver      | Team support                  |
| Romeo Jr. Seneres        | Team support                  |

---

_Developed as a requirement for Software Development at Bestlink College of the Philippines, College of Computer Studies, Computer Engineering Department._
