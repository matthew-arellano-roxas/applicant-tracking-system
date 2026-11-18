# Page Guide

[Back to documentation](../README.md) · [Repository home](../../README.md)

This guide maps the current screens to their routes and describes what each view contains. Authenticated workspace pages require a signed-in user with the listed role. Screenshots are intentionally left for the project maintainers to add.

## Add screenshots

Put screenshots in `docs/screenshots/` using the filenames listed with each page. To display a screenshot below the relevant table, add a Markdown image line using its relative path:

```md
![Sign-in page](../screenshots/sign-in.png)
```

The [screenshot folder README](../screenshots/README.md) repeats the suggested filenames. Use test data or obscure personal information before committing screenshots.

## Public and account pages

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Sign in | `/login` | Email and password sign-in form, password visibility toggle, and links to account registration and password reset. | `sign-in.png` |
| Create account | `/register` | Applicant registration form followed by email verification. | `register.png` |
| Forgot password | `/forgot-password` | Email reset-code request, verification, and new-password form. | `forgot-password.png` |

## Applicant pages

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Open jobs | `/a/jobs` | Open positions, search and filters, CV readiness, and application actions. | `applicant-jobs.png` |
| My applications | `/a/applications` | Submitted applications, current status, progress stages, and CV review status. | `applicant-applications.png` |
| My interviews | `/a/interviews` | The applicant's interview schedule and joining or location details when provided. | `applicant-interviews.png` |
| My CV | `/a/cv` | Upload, replace, or download a PDF CV (up to 5 MB). | `applicant-cv.png` |

## HR and Administrator pages

HR and Administrators can access the following recruitment pages:

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Recruitment overview | `/h/dashboard` | Recruitment summary metrics and items that need attention. | `hr-overview.png` |
| Applications | `/h/applications` | Applicant review and application management. | `hr-applications.png` |
| Hiring requests | `/h/job-posts` | Hiring request list and request-management workspace. | `hr-hiring-requests.png` |
| Published job posts | `/h/job-posts/published` | Published positions and controls for managing them. | `hr-job-posts.png` |
| Hiring request details | `/h/hiring-requests/:id` | Details and actions for a selected hiring request. | `hr-request-details.png` |
| Interviews | `/h/interviews` | Interview scheduling and interview management. | `hr-interviews.png` |
| Employee documents | `/h/employees` | Employee records and document checklist management. | `hr-employees.png` |

## Department Head pages

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Staffing requests | `/d/requests` | Requests for the Department Head's assigned department. | `department-head-requests.png` |
| Request details | `/d/requests/:id` | Detail view for a selected staffing request. | `department-head-request-details.png` |
| Interview evaluations | `/d/evaluations` | Assigned interviews and evaluation workflow. | `department-head-evaluations.png` |

## Dean pages

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Hiring approvals | `/n/approvals` | Pending staffing requests with approve and reject actions. | `dean-approvals.png` |

## Administrator pages

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Users and roles | `/m/users` | Search and filter users, review account information, and assign roles. | `admin-users.png` |
| Departments | `/m/departments` | Manage departments and their membership. | `admin-departments.png` |

## Employee pages

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| My interviews | `/e/interviews` | Interviews assigned to the employee and evaluation actions. | `employee-interviews.png` |
| My documents | `/e/documents` | Personal employee document checklist and completion status. | `employee-documents.png` |

## Shared account page

| Page | Route | What the view contains | Screenshot file |
| --- | --- | --- | --- |
| Settings | `/settings` | Update account information and change the current password. | `settings.png` |

## Route shortcuts

These older, shorter routes redirect to the role-specific pages above; they do not have separate page views:

| Shortcut | Destination |
| --- | --- |
| `/jobs` | Applicant jobs or HR job posts |
| `/applicants` | HR applications |
| `/interviews` | Applicant, employee, or HR interviews |
| `/employees` | Employee documents or HR employee records |
| `/team` | HR employee records |
| `/hiring-requests` | Department Head requests, Dean approvals, or HR hiring requests |
| `/departments` | Administrator departments |
