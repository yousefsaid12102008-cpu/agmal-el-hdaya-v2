// This is a request only. The server always creates a pending profile.
export function profileRequest(requestedRole = 'customer') {
  if (!['customer', 'employee'].includes(requestedRole)) {
    throw new Error('invalid-requested-role');
  }
  return {requestedRole};
}
