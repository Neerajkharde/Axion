import { getAuthUser } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

import React from 'react'

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
  });

  return {isLoading: authUser.isLoading, authUser: authUser.data?.user};
}


export default useAuthUser


