import type { CurrentUser } from '@ats/shared-types';

export function getUserName(user: CurrentUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getUserInitials(user: CurrentUser) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() || 'U';
}
