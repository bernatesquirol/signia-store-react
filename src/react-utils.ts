import { getAtoms, atom, computed, get } from "@natesq/signia-store"
import  React, {useMemo, createContext, useContext, Ref, useRef} from "react"
import { useValue as useValueSignia,} from 'signia-react'
export const useComputed = (key, func, ctxs=['store'], ctxWrite=['store'], alias={}, specificContexts={})=>{
  return useMemo(()=>{
    return computed(key, func, ctxs, ctxWrite, alias, specificContexts)
  },[])
}
export const useAtom = (key, value, ctxs: string|string[]=['store'])=>{
  return useMemo(() => {
		return atom(key, value, ctxs)
	}, [])
}
export const useGetAtoms = (list, ctxs=['store'])=>{
  return useMemo(()=>{
    return getAtoms(list, ctxs)
  },[])
}
export const useGetAtom = (key, ctx='store')=>{
  return useMemo(()=>{
    let atomObj = get(key,ctx)
    return atomObj
  },[])
}
// export const useValues = (list, ctxs=['store'])=>{
//   return useMemo(()=>{
//     return getAtoms(list, ctxs)
//   },[])
// }
export const useValue = (key, ctx='store')=>{
  const atom = useGetAtom(key, ctx)
  return useValueSignia(atom)
}
export function useValues(keys, ctxs=['store']) {
	const atomsObj = useGetAtoms(keys, ctxs)
  	const atoms = Object.values(atomsObj)
	return useValueSignia(keys.join(","), () => {
		return Object.entries(atomsObj).reduce((acc,[aKey, aValue]:any)=>({...acc, [aKey.replace("Atom", '')]: aValue.value}),{})
	}, atoms)
}
type ParamsAtom =Parameters<typeof atom>[1]//|[Parameters<typeof atom>[1]]
type ParamsComputed =Parameters<typeof computed>[1]|[Parameters<typeof computed>[1], Parameters<typeof computed>[3],Parameters<typeof computed>[4]]
type StoreValueCtx = {id:string|string[], atoms: Record<string,ParamsAtom>, computed: Record<string,ParamsComputed>}
export const storeContextFactory = (ids:string|string[])=>createContext<string|string[]>(ids) as React.Context<string|string[]>
export const StoreContext = storeContextFactory('store')
export const storeContextProviderFactory = (StoreContextParam)=>({value, children}: {value:StoreValueCtx, children:any})=>{
  const init: Ref<boolean> = useRef(false)
  if (!init.current){
    let {atoms, computed: computedAtoms} = value||{}
    Object.entries(atoms||{}).forEach(([atomK, args])=>{
      // if (!Array.isArray(args)){args = [args]}
      atom(atomK, args, value.id)
    })
    Object.entries(computedAtoms||{}).forEach(([atomK, args])=>{
      let func,specificContexts, ctxs
      if (Array.isArray(args)){
        func = args[0]
        ctxs = args[1]
        specificContexts = args[2]
      }else{
        func = args
        ctxs = value.id
      }
      computed(atomK, func, ctxs, value.id, specificContexts)
    })
    init.current=true
  }
  return React.createElement(StoreContextParam.Provider,
    {value:value.id},
    children
    ) as React.FC<{value:StoreValueCtx}>
}
export const StoreContextProvider = storeContextProviderFactory(StoreContext)
export function useComputedCtx(key, func, ctxWrite=null, alias={}, specificContexts={}, StoreContext_=StoreContext) {
	const ctxs = useContext(StoreContext_)
  if (!ctxWrite){
    ctxWrite = ctxs
  }
  return useComputed(key, func, ctxs, ctxWrite, alias, specificContexts)
}
export function useAtomCtx(key, value, StoreContext_=StoreContext) {
	const ctxs = useContext(StoreContext_)
  return useAtom(key, value, ctxs)
}
export function useGetAtomsCtx(list, StoreContext_=StoreContext) {
	const ctxs = useContext(StoreContext_)
  return useGetAtoms(list, ctxs)
}
export function useGetAtomCtx(key, StoreContext_=StoreContext) {
	const ctxs = useContext(StoreContext_)
  return useGetAtom(key, ctxs)
}
export function useValueCtx(key, StoreContext_=StoreContext) {
	const ctxs = useContext(StoreContext_)
  return useValue(key, ctxs)
}
export function useValuesCtx(keys, StoreContext_=StoreContext) {
	const ctxs = useContext(StoreContext_)
  return useValues(keys, ctxs)
}
