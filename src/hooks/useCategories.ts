import { useQuery } from "@tanstack/react-query";
import { getCasesCategories } from "../api-client/index";

interface Category {
  id: string;
  name: string;
}

const CATEGORIES_QUERY_KEY = ["categories"] as const;
const THIRTY_MINUTES = 30 * 60 * 1000;

export const useCategories = (enabled = true) => {
  return useQuery<Category[]>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await getCasesCategories();
      return data;
    },
    enabled,
    staleTime: Infinity,
    gcTime: THIRTY_MINUTES,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
