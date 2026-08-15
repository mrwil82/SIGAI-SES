import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { prefetchAllData } from "../hooks/usePrefetchData";

export const DataPrefetcher: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const prefetchedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    if (prefetchedFor.current === user.id_usuario) return;

    prefetchedFor.current = user.id_usuario;
    prefetchAllData(queryClient);
  }, [user, queryClient]);

  return null;
};
