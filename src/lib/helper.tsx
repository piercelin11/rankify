

export function generateSearchParams(object: {[index: string]: string}): string {
    return new URLSearchParams(object).toString()
  }

  