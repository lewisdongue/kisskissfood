import { useQuery } from "@tanstack/react-query";
import { marketplaceGiftsService } from "@/services/marketplaceGiftsService";

export const useMarketplaceGifts = () => {
  return useQuery({
    queryKey: ["marketplace", "gifts"],
    queryFn: marketplaceGiftsService.listActive,
    refetchOnWindowFocus: true,
    placeholderData: (prev) => prev,
  });
};


