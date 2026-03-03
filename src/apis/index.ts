import { QueryClient, useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type {
  GetVariantDetailsParams,
  ChannelContentPayload,
  UpdateVariantContentParams,
  UseVariantDetailsParams,
  UploadFileParams,
  UseMockDataParams,
  GetMockDataParams,
  MockDataQueryParams,
  JsonnetRenderBody,
  JsonnetRenderResponse,
} from '@/types';
import { createQueryParams, deepMerge } from '@/lib/utils';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';

const API_BASE_URL = 'https://stagingapi2.suprsend.com';
const JSONNET_API_BASE_URL = 'https://stagingapi.suprsend.com/jsonnet';

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
  isPrivate,
}: GetVariantDetailsParams) => {
  const qp = createQueryParams({ conditions, locale, tenantId });
  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/${qp}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/channel/${chanelSlug}/variant/${variantId}/${qp}`;

  const resp = await axiosInst.get(url);
  return resp.data;
};

export const useVariantDetails = ({
  templateSlug,
  chanelSlug,
  variantId,
}: UseVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions, isPrivate } =
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
        isPrivate,
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
  isPrivate,
}: UpdateVariantContentParams) => {
  const qp = createQueryParams({ conditions, locale, tenantId });
  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/content/${qp}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/channel/${chanelSlug}/variant/${variantId}/content/${qp}`;

  const resp = await axiosInst.patch(url, payload);
  return resp.data;
};

export const useUpdateVariantContent = ({
  templateSlug,
  chanelSlug,
  variantId,
}: UseVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions, isPrivate } =
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
        isPrivate,
      }),
    //TODO : onsuccess logic

    // onSuccess: (_data, payload) => {
    //   queryClient.setQueryData(
    //     queryKey,
    //     (old: Record<string, unknown> | undefined) => {
    //       if (!old) return old;
    //       const updated = structuredClone(old);
    //       deepMerge(updated, payload as unknown as Record<string, unknown>);
    //       return updated;
    //     }
    //   );
    // },
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

const getMockData = async ({
  templateSlug,
  workspaceUid,
  tenantId,
  recipientDistinctId,
  actorDistinctId,
  isPrivate,
}: GetMockDataParams) => {
  let queryObject: MockDataQueryParams = {};

  if (!isPrivate) {
    queryObject = {
      tenant_id: tenantId,
      recipient_distinct_id: recipientDistinctId,
      actor_distinct_id: actorDistinctId,
    };
  }

  const qp = createQueryParams({ ...queryObject });

  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/mock_data/${qp}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/embedded/${templateSlug}/mock_data/${qp}`;

  const resp = await axiosInst.get(url);
  return resp.data;
};

export const useMockData = ({ templateSlug }: UseMockDataParams) => {
  const {
    tenantId,
    workspaceUid,
    isPrivate,
    recipientDistinctId,
    actorDistinctId,
  } = useTemplateEditorContext();
  return useQuery({
    queryKey: [`template/${templateSlug}/mock_data`],
    queryFn: () =>
      getMockData({
        templateSlug,
        workspaceUid,
        tenantId,
        isPrivate,
        recipientDistinctId,
        actorDistinctId,
      }),
  });
};

const renderJsonnet = async (
  body: JsonnetRenderBody
): Promise<JsonnetRenderResponse> => {
  const resp = await axiosInst.post(`${JSONNET_API_BASE_URL}/render/`, body);
  return resp.data;
};

export const useJsonnetRender = () => {
  return useMutation({
    mutationFn: (body: JsonnetRenderBody) => renderJsonnet(body),
  });
};
