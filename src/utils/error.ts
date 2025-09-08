export function report(error: Error, message: string) {
  console.error(error);
  return message;
}
