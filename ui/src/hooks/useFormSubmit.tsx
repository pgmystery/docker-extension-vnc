import { RefObject, SyntheticEvent, useRef } from 'react'


export type UseFormSubmitEvent = SyntheticEvent<HTMLFormElement, CustomEvent<string>>


export default function useFormSubmit<T extends HTMLFormElement>(): [RefObject<T>, (submitter: string, eventInitDict?: EventInit)=>boolean] {
  const formRef = useRef<T>(null)

  function submit(submitter: string, eventInitDict?: EventInit) {
    if (!formRef.current)
      throw new Error('The ref is not used')

    return formRef.current.dispatchEvent(
      new CustomEvent("submit", {
        cancelable: true,
        bubbles: true,
        ...eventInitDict,
        detail: submitter,
      })
    )
  }

  return [
    formRef,
    submit,
  ]
}
