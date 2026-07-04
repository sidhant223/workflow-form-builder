// src/workflow/rolePermissions.js
// Simulated role-based permissions (no real auth). Gates which workflow
// action types a role can perform, and whether they can configure workflows.

export const ROLE_PERMISSIONS = {
  Employee: { actions: ["advance"], canConfigureWorkflows: false, canManageForms: false },
  Manager: { actions: ["advance", "approve", "reject"], canConfigureWorkflows: false, canManageForms: false },
  Admin: { actions: ["advance", "approve", "reject"], canConfigureWorkflows: true, canManageForms: true },
};

export function canPerformAction(role, actionType) {
  return ROLE_PERMISSIONS[role]?.actions.includes(actionType) ?? false;
}

export function canConfigureWorkflows(role) {
  return ROLE_PERMISSIONS[role]?.canConfigureWorkflows ?? false;
}

export function canManageForms(role) {
  return ROLE_PERMISSIONS[role]?.canManageForms ?? false;
}
