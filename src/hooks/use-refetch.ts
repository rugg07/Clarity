import { api } from '@/trpc/react'
import {useLocalStorage} from 'usehooks-ts'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'

//automatically fetch newly created project and show in on the sidebar screen
const useRefetch = () => {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.refetchQueries({
        type: "active"
    })
  }
}

export default useRefetch