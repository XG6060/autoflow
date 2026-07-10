/** Maps technical error messages to user-friendly versions. */
export function humanizeError(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes('cycle detected') || lower.includes('cycle')) {
    return 'Your workflow contains a loop. Remove one connection to break the cycle and try again.';
  }
  if (lower.includes('url is required') || lower.includes('url')) {
    return 'This HTTP Request node needs a URL. Click the node and fill in the URL field.';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'The request took too long. The target server may be slow or unreachable. Try again or increase the timeout.';
  }
  if (lower.includes('unknown node type')) {
    return 'This node type is not supported by the execution engine. Check if it needs to be updated.';
  }
  if (lower.includes('failed to parse')) {
    return 'The engine output could not be read. This is likely a temporary issue. Try running again.';
  }
  if (lower.includes('engine execution failed')) {
    return 'The workflow engine encountered an error. Check each node configuration and try again.';
  }
  if (lower.includes('network') || lower.includes('econnrefused') || lower.includes('dns')) {
    return 'Could not reach the target server. Check the URL and make sure the service is online.';
  }
  if (lower.includes('401') || lower.includes('unauthorized')) {
    return 'Authentication failed. Check your API key or credentials in the node configuration.';
  }
  if (lower.includes('403') || lower.includes('forbidden')) {
    return 'Access denied by the target server. Verify your permissions.';
  }
  if (lower.includes('429')) {
    return 'Rate limited by the target API. Slow down or add a Delay node before this step.';
  }
  if (lower.includes('500') || lower.includes('502') || lower.includes('503')) {
    return 'The target server is experiencing issues. Try again later.';
  }
  if (lower.includes('validation error') || lower.includes('invalid')) {
    return 'Some configuration is invalid. Review each node and make sure all required fields are filled.';
  }

  // Fallback: truncate long raw messages
  if (raw.length > 200) {
    return raw.slice(0, 200) + '...';
  }
  return raw;
}
