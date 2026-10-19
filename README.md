# Applicant Tracking System for Bestlink College of the Philippines

> A centralized platform for managing the recruitment of teaching and non-teaching personnel, from staffing request to department assignment.

**Course:** Software Development (Project-Based Elective 3)
**Instructor:** Engr. Patricia Praxedes A. Gloria
**Program:** 4th Year, Computer Engineering
**Institution:** College of Computer Studies, Computer Engineering Department, Bestlink College of the Philippines

---

## Table of Contents

- [Development Setup](#development-setup)
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

## Development Setup

This repository uses pnpm workspaces for the API, web app, and shared TypeScript contracts.
Run package commands from the repository root so pnpm links `@ats/shared-types` into both apps.

```sh
pnpm install
pnpm dev          # Run the API and web app
pnpm dev:api      # Run only the API
pnpm dev:web      # Run only the web app
pnpm build        # Build all workspace packages with a build script
```

Use pnpm for dependency changes too. For example, `pnpm --filter @ats/web add axios` adds a
web-only dependency. The old `package-lock.json` files inside the moved apps are not used by the
workspace; `pnpm install` at the root creates and updates the single `pnpm-lock.yaml`.

Add cross app contracts to `packages/shared-types/src/index.ts`, then import them from either app:

```ts
import type { ApiResponse } from '@ats/shared-types';
```

Request validation schemas are shared too. Import one from the package root or the `schemas` subpath,
and derive its TypeScript type with Zod when needed:

```ts
import { createApplicationBodySchema } from '@ats/shared-types/schemas';
import type { z } from 'zod';

export type CreateApplicationInput = z.infer<typeof createApplicationBodySchema>;
const result = createApplicationBodySchema.safeParse({ jobPostId: 'job-123' });
```

The shared package is built before the root dev commands and as a dependency of workspace builds.
API schema imports under `@/schemas/*` continue to work through re-export files.

Add dependencies to a specific workspace with `pnpm --filter @ats/api add <package>` or
`pnpm --filter @ats/web add <package>`.

### Web UI conventions

- Use React Router Data Mode for application routes. Keep shared navigation and page chrome in the
  layout route, and render nested pages through its `<Outlet />`.
- Follow the shadcn preset configured in `apps/web/components.json` (`base-luma`, `mist`, and the
  `lucide` icon library). Use the existing CSS theme variables and semantic Tailwind classes such
  as `bg-background`, `text-foreground`, `bg-card`, `border-border`, and `text-muted-foreground`.
- Build prebuilt interface elements with shadcn/ui components and use `lucide-react` for icons.
  Keep spacing, colors, borders, and radii consistent with the preset; avoid introducing one-off
  colors or a separate visual system for individual pages.
- Use Tailwind CSS for page layout and component styling.
- Use Zustand for client state shared across routes or components, such as the authenticated user and
  session status. Keep state used by only one page or component local, and organize store state and
  actions by domain. Keep API requests and reusable behavior in hooks or service modules so UI
  components focus on rendering and event wiring.

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
