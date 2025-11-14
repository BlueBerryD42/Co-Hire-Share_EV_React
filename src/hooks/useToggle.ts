import { useCallback, useState } from 'react'

type UseToggleReturn = [boolean, () => void, () => void, () => void]

const useToggle = (initialValue = false): UseToggleReturn => {
  const [value, setValue] = useState<boolean>(initialValue)

  const toggle = useCallback(() => {
    setValue((prev) => !prev)
  }, [])

  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, toggle, setTrue, setFalse]
}

export default useToggle

