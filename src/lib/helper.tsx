

export function generateSearchParams(object: {[index: string]: string}): string {
    return new URLSearchParams(object).toString()
  }


  export function generateApiRoute(route: string, searchParams: {[index: string]: string}): string  {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/${route}?` + generateSearchParams(searchParams)
  }
  