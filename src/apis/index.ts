import { QueryClient, useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type {
  GetVariantDetailsParams,
  ChannelContentPayload,
  UpdateVariantContentParams,
  useVariantDetailsParams,
  UploadFileParams,
} from '@/types';
import { createQueryParams, deepMerge } from '@/lib/utils';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

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
}: useVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions } =
    useTemplateEditorContext();
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

const updateVariantContent = async ({
  templateSlug,
  chanelSlug,
  variantId,
  workspaceUid,
  conditions,
  locale,
  tenantId,
  payload,
}: UpdateVariantContentParams) => {
  const qp = createQueryParams({ conditions, locale, tenantId });
  const url = `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/content/${qp}`;
  const resp = await axiosInst.patch(url, payload);
  return resp.data;
};

export const useUpdateVariantContent = ({
  templateSlug,
  chanelSlug,
  variantId,
}: GetVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions } =
    useTemplateEditorContext();
  const queryKey = [
    `template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}`,
  ];

  return useMutation({
    mutationFn: (payload: ChannelContentPayload) =>
      updateVariantContent({
        templateSlug,
        chanelSlug,
        variantId,
        workspaceUid,
        conditions,
        locale,
        tenantId,
        payload,
      }),
    onSuccess: (_data, payload) => {
      queryClient.setQueryData(
        queryKey,
        (old: Record<string, unknown> | undefined) => {
          if (!old) return old;
          const updated = structuredClone(old);
          deepMerge(updated, payload as unknown as Record<string, unknown>);
          return updated;
        }
      );
    },
  });
};

const uploadFile = async ({ workspaceUid, file }: UploadFileParams) => {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE_URL}/v1/${workspaceUid}/public/upload_file/`;
  const resp = await axiosInst.put(url, formData);
  return resp.data;
};

export const useUploadFile = (workspaceUid: string) => {
  return useMutation({
    mutationFn: (file: File) => uploadFile({ workspaceUid, file }),
  });
};
