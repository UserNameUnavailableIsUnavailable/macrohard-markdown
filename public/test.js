const DELIM_PAIRS = [
  ["\\(", "\\)"],
  ["\\[", "\\]"]
]

let str = "\\(F = ma\\)"

let ret = DELIM_PAIRS.some(pair => {
  return str.startsWith(pair[0])
})

console.log(ret)
