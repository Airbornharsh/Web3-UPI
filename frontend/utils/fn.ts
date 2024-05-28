export const dictToArray = (dict: any): number[] => {
  let array: number[] = []
  for (let key in dict) {
    array.push(dict[key])
  }
  return array
}
