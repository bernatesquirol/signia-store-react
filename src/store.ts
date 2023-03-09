import { atom as atomSignia, computed as computedSignia } from 'signia'

export function get(key, ctx='store'){
  if (!globalThis[ctx]){
    globalThis[ctx] = {}
  }
  return globalThis[ctx][key]
}
export function setSingle(key, atom, ctx: string='store'){
  if (!globalThis[ctx]){
    globalThis[ctx] = {}
  }
  globalThis[ctx][key] = atom
  return globalThis[ctx][key]
}
export function set(key, atom, ctxs:string|string[]='store'){
  if (!Array.isArray(ctxs)){
    ctxs = [ctxs]
  }
  ctxs.forEach(ctx=>setSingle(key, atom, ctx))
}
export function atom(key, value, ctxs: string|string[]='store') {  
  let atomS = atomSignia(key, value)
  set(key, atomS, ctxs)  
  return atomS
}
const subsAll = (stringFunc, transformMatch)=>{
  let regex = /\b\w+(?=\s*\.\s*value\b)/g
  let matches = stringFunc.match(regex)
    // console.log(matches)
  for (let match of matches){
    let new_reg = new RegExp(`${match}\.value`)
    let new_value = transformMatch(match)//`globalThis[${match}].value`
    if (new_value!=null){
      stringFunc = stringFunc.replace(new_reg, new_value)
    }
  }
  return stringFunc
}
// type a = Parameters<typeof computedSignia<any,any>>
export function computed<T,K>(key, func, ctxs=['store'], ctxWrite: string|string[]="store") {
  if (!Array.isArray(ctxs)) ctxs = [ctxs]
  // globalThis[key] = computedSignia<T,K>(key, func)
  let stringFunc = func.toString()
  const transformMatch = (match)=>{
    let filtered = ctxs.filter(ctx=>globalThis[ctx] && globalThis[ctx][match])
    if (filtered.length>0){
      if (filtered.length>1) console.log('STORE', 'multiple context found', match)
      const selectedCtx = filtered[0]
      return `globalThis["${selectedCtx}"]["${match}"].value`
    }else{
      console.log('STORE', 'no context found', match)
    }
    return null
  }
  let stringFuncNew = subsAll(stringFunc, transformMatch) // match=>`globalThis["${ctx}"]["${match}"].value`
  let newFunc = new Function("return "+stringFuncNew)()
  let atomComputed = computedSignia<T,K>(key, newFunc)
  set(key, atomComputed, ctxWrite)
  return atomComputed
}