import { QueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { GetVariantDetailsParams } from '@/types';
import { createQueryParams } from '@/lib/utils';

const API_BASE_URL = 'https://stagingapi2.suprsend.com';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 404)
          return false;
        return failureCount < 4;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export const axiosInst = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const getVariantDetails = async ({
  templateSlug,
  chanelSlug,
  variantId,
  conditions,
  locale,
  tenantId,
  workspaceUid,
}: GetVariantDetailsParams) => {
  const qp = createQueryParams({ conditions, locale, tenantId });
  const url = `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/${qp}`;
  const resp = await axiosInst.get(url);
  return resp.data;
};

export const useVariantDetails = ({
  templateSlug,
  chanelSlug,
  variantId,
  locale,
  tenantId,
  conditions,
  workspaceUid,
}: GetVariantDetailsParams) => {
  return useQuery({
    queryKey: [
      `template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}`,
    ],
    queryFn: () =>
      getVariantDetails({
        templateSlug,
        chanelSlug,
        variantId,
        locale,
        tenantId,
        conditions,
        workspaceUid,
      }),
  });
};
