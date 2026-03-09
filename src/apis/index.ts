import {
  QueryClient,
  useQuery,
  useMutation,
  keepPreviousData,
} from '@tanstack/react-query';
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
  CommitTemplateParams,
  CommitTemplateMutationPayload,
  UseCommitTemplateParams,
} from '@/types';
import { createQueryParams } from '@/lib/utils';
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
  mode,
}: GetVariantDetailsParams) => {
  const qp = createQueryParams({ conditions, locale, tenantId, mode });
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
  const { locale, tenantId, workspaceUid, conditions, isPrivate, mode } =
    useTemplateEditorContext();

  return useQuery(
    {
      queryKey: [
        `template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}`,
        mode,
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
          mode,
        }),
    },
    queryClient
  );
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
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/content/`
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

  return useMutation(
    {
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
    },
    queryClient
  );
};

const uploadFile = async ({ workspaceUid, file }: UploadFileParams) => {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE_URL}/v1/${workspaceUid}/public/upload_file/`;
  const resp = await axiosInst.put(url, formData);
  return resp.data;
};

export const useUploadFile = (workspaceUid: string) => {
  return useMutation(
    {
      mutationFn: (file: File) => uploadFile({ workspaceUid, file }),
    },
    queryClient
  );
};

const getMockData = async ({
  templateSlug,
  workspaceUid,
  tenantId,
  recipientDistinctId,
  actorDistinctId,
  isPrivate,
  mode,
}: GetMockDataParams) => {
  let queryObject: MockDataQueryParams = {};

  if (!isPrivate) {
    queryObject = {
      tenant_id: tenantId,
      recipient_distinct_id: recipientDistinctId,
      actor_distinct_id: actorDistinctId,
    };
  }

  const qp = createQueryParams({ ...queryObject, mode });

  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/mock_data/${qp}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/embedded/${templateSlug}/mock_data/${qp}`;

  const resp = await axiosInst.get(url);
  return resp.data;
};

const getPreCommitValidate = async ({
  templateSlug,
  workspaceUid,
  isPrivate,
}: {
  templateSlug: string;
  workspaceUid: string;
  isPrivate: boolean;
}) => {
  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/pre_commit_validate/`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/pre_commit_validate/`;
  const resp = await axiosInst.post(url);
  return resp.data;
};

export const usePreCommitValidate = ({
  templateSlug,
  enabled,
}: {
  templateSlug: string;
  enabled: boolean;
}) => {
  const { workspaceUid, isPrivate } = useTemplateEditorContext();
  return useQuery(
    {
      queryKey: [`template/${templateSlug}/pre_commit_validate`],
      queryFn: () =>
        getPreCommitValidate({ templateSlug, workspaceUid, isPrivate }),
      enabled,
    },
    queryClient
  );
};

export const useMockData = ({ templateSlug }: UseMockDataParams) => {
  const {
    tenantId,
    workspaceUid,
    isPrivate,
    recipientDistinctId,
    actorDistinctId,
    mode,
  } = useTemplateEditorContext();
  return useQuery(
    {
      queryKey: [`template/${templateSlug}/mock_data`, mode],
      queryFn: () =>
        getMockData({
          templateSlug,
          workspaceUid,
          tenantId,
          isPrivate,
          recipientDistinctId,
          actorDistinctId,
          mode,
        }),
    },
    queryClient
  );
};

const getSMSHeaders = async ({
  workspaceUid,
  notifCategory,
}: {
  workspaceUid: string;
  notifCategory: string;
}) => {
  const url = `${API_BASE_URL}/v1/${workspaceUid}/tenant/default/vendor/sms_headers/?root_category=${notifCategory}`;
  const resp = await axiosInst.get(url);
  return resp.data;
};

export const useSMSHeaders = (notifCategory: string) => {
  const { workspaceUid } = useTemplateEditorContext();

  return useQuery(
    {
      queryKey: [
        `${workspaceUid}/tenant/default/vendor/sms_headers`,
        notifCategory,
      ],
      queryFn: () => getSMSHeaders({ workspaceUid, notifCategory }),
      placeholderData: keepPreviousData,
      enabled: !!notifCategory,
    },
    queryClient
  );
};

const renderJsonnet = async (
  body: JsonnetRenderBody
): Promise<JsonnetRenderResponse> => {
  const resp = await axiosInst.post(`${JSONNET_API_BASE_URL}/render/`, body);
  return resp.data;
};

export const useJsonnetRender = () => {
  return useMutation(
    {
      mutationFn: (body: JsonnetRenderBody) => renderJsonnet(body),
    },
    queryClient
  );
};

const commitTemplate = async ({
  templateSlug,
  workspaceUid,
  isPrivate,
  commitMessage,
  variants,
}: CommitTemplateParams) => {
  const qp = createQueryParams({ commit_message: commitMessage });
  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/commit/${qp}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/commit/${qp}`;

  const resp = await axiosInst.patch(url, { variants });
  return resp.data;
};

export const useCommitTemplate = ({
  templateSlug,
}: UseCommitTemplateParams) => {
  const { workspaceUid, isPrivate } = useTemplateEditorContext();
  return useMutation(
    {
      mutationFn: ({
        commitMessage,
        variants,
      }: CommitTemplateMutationPayload) =>
        commitTemplate({
          templateSlug,
          workspaceUid,
          isPrivate,
          commitMessage,
          variants,
        }),
    },
    queryClient
  );
};
