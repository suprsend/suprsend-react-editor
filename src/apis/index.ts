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
import { useQuery } from '@/lib/useQuery';
import { useMutation } from '@/lib/useMutation';
import { FetchClient } from '@/lib/fetchClient';
export { invalidateQueries } from '@/lib/queryCache';
export { isHttpError } from '@/lib/fetchClient';

const API_BASE_URL = 'https://stagingapi2.suprsend.com';
const JSONNET_API_BASE_URL = 'https://stagingapi.suprsend.com/jsonnet';

export const fetchClient = new FetchClient({
  baseURL: API_BASE_URL,
  credentials: 'include',
});

// ---------- API functions ----------

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
  const qp = createQueryParams({
    conditions,
    locale,
    tenant_id: tenantId,
    mode,
  });
  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/${qp}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/channel/${chanelSlug}/variant/${variantId}/${qp}`;

  const resp = await fetchClient.get(url);
  return resp.data;
};

export const useVariantDetails = ({
  templateSlug,
  chanelSlug,
  variantId,
}: UseVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions, isPrivate, mode } =
    useTemplateEditorContext();

  return useQuery({
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
  const qp = createQueryParams({ conditions, locale, tenant_id: tenantId });
  const url = isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}/content/`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/channel/${chanelSlug}/variant/${variantId}/content/${qp}`;

  const resp = await fetchClient.patch(url, payload);
  return resp.data;
};

export const useUpdateVariantContent = ({
  templateSlug,
  chanelSlug,
  variantId,
}: UseVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions, isPrivate } =
    useTemplateEditorContext();

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
  });
};

const uploadFile = async ({ workspaceUid, file }: UploadFileParams) => {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE_URL}/v1/${workspaceUid}/public/upload_file/`;
  const resp = await fetchClient.put(url, formData);
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
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}/embedded/mock_data/${qp}`;

  const resp = await fetchClient.get(url);
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
  const resp = await fetchClient.post(url);
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
  return useQuery({
    queryKey: [`template/${templateSlug}/pre_commit_validate`],
    queryFn: () =>
      getPreCommitValidate({ templateSlug, workspaceUid, isPrivate }),
    enabled,
  });
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
  return useQuery({
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
  });
};

const getInboxTags = async ({
  workspaceUid,
  search,
}: {
  workspaceUid: string;
  search: string;
}) => {
  const url = `${API_BASE_URL}/v1/${workspaceUid}/inbox_tag/?search=${encodeURIComponent(search)}&limit=50`;

  const resp = await axiosInst.get(url);
  return resp.data;
};

export const useInboxTags = (search: string) => {
  const { workspaceUid } = useTemplateEditorContext();

  return useQuery({
    queryKey: ['inbox_tags', search],
    queryFn: () => getInboxTags({ workspaceUid, search }),
  });
};

const renderJsonnet = async (
  body: JsonnetRenderBody
): Promise<JsonnetRenderResponse> => {
  const resp = await fetchClient.post(`${JSONNET_API_BASE_URL}/render/`, body);
  return resp.data as JsonnetRenderResponse;
};

export const useJsonnetRender = () => {
  return useMutation({
    mutationFn: (body: JsonnetRenderBody) => renderJsonnet(body),
  });
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

  const resp = await fetchClient.patch(url, { variants });
  return resp.data;
};

export const useCommitTemplate = ({
  templateSlug,
}: UseCommitTemplateParams) => {
  const { workspaceUid, isPrivate } = useTemplateEditorContext();
  return useMutation({
    mutationFn: ({ commitMessage, variants }: CommitTemplateMutationPayload) =>
      commitTemplate({
        templateSlug,
        workspaceUid,
        isPrivate,
        commitMessage,
        variants,
      }),
  });
};
