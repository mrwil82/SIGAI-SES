import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '../services/inventory';

export const useInventory = (skip: number, limit: number, search?: string, refreshVersion?: number, includeDeleted?: boolean) => {
  return useQuery({
    queryKey: ['inventory', skip, limit, search, refreshVersion, includeDeleted],
    queryFn: () => getInventoryItems(skip, limit, search, undefined, includeDeleted),
  });
};
