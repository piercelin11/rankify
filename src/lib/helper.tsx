export function generateSearchParams(object: {[index: string]: string}): string {
    return new URLSearchParams(object).toString()
}

export function dateToLong(date: Date | null){
  if (!date) return null;
  
  const originalDate = new Date(date);
  const formattedDate = originalDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return formattedDate;
}

export function dateToDashFormat(date: Date | null){
  if (!date) return "No Date"
  const d = new Date(date);

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}



  