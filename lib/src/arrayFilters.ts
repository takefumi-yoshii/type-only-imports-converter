export function removeUndefined<T>(arg: T): arg is NonNullable<T> {
  return arg !== undefined
}
