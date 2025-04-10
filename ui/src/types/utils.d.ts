export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
  [K in Keys]-?:
  Required<Pick<T, K>>
  & Partial<Record<Exclude<Keys, K>, undefined>>
}[Keys]

export type ObjectValueTypes<T> = T[keyof T]

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
                                                              ? Acc[number]
                                                              : Enumerate<N, [...Acc, Acc['length']]>

export type NumberRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

type AbstractConstructorHelper<T> = (new (...args: any) => { [x: string]: any; }) & T;
export type AbstractConstructorParameters<T> = ConstructorParameters<AbstractConstructorHelper<T>>;
