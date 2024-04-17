export class Guard {
  /**
   * Checks if value is empty. Accepts strings, numbers, booleans, objects and arrays.
   */
  static isEmpty(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      return true;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return false;
    }

    if (value instanceof Date) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length === 0 || value.every((item) => Guard.isEmpty(item));
    }

    return typeof value === 'object' && Object.keys(value).length === 0;
  }

  /**
   * Checks length range of a provided number/string/array
   */
  static lengthIsBetween(
    value: number | string | Array<unknown>,
    min: number,
    max: number,
  ): boolean {
    if (Guard.isEmpty(value)) {
      throw new Error(
        'Cannot check length of a value. Provided value is empty',
      );
    }
    const valueLength =
      typeof value === 'number'
        ? Number(value).toString().length
        : value.length;
    if (valueLength >= min && valueLength <= max) {
      return true;
    }
    return false;
  }
}
