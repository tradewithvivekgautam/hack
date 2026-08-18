export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("User rejected") || error.message.includes("rejected the request")) return "The wallet request was rejected.";
    if (error.message.includes("insufficient funds")) return "The wallet does not have enough OKB for gas.";
    return error.message;
  }
  return String(error);
}
