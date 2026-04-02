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
  MockTestPayload,
  ChannelVariantMockTestParams,
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

function templateBasePath(
  workspaceUid: string,
  templateSlug: string,
  isPrivate: boolean,
  version?: string
) {
  const versionSegment = version ? `/version/${version}` : '';
  return isPrivate
    ? `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}${versionSegment}`
    : `${API_BASE_URL}/v2/${workspaceUid}/template/${templateSlug}${versionSegment}/embedded`;
}

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
  version,
}: GetVariantDetailsParams) => {
  const qp = createQueryParams({
    conditions,
    locale,
    tenant_id: tenantId,
    mode,
  });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/channel/${chanelSlug}/variant/${variantId}/${qp}`;

  const resp = await fetchClient.get(url);
  return resp.data;
};

export const useVariantDetails = ({
  templateSlug,
  chanelSlug,
  variantId,
}: UseVariantDetailsParams) => {
  const {
    locale,
    tenantId,
    workspaceUid,
    conditions,
    isPrivate,
    mode,
    version,
  } = useTemplateEditorContext();

  return useQuery({
    queryKey: [
      `template/${templateSlug}/channel/${chanelSlug}/variant/${variantId}`,
      mode,
      version,
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
        version,
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
  version,
}: UpdateVariantContentParams) => {
  const qp = createQueryParams({ conditions, locale, tenant_id: tenantId });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = isPrivate
    ? `${base}/channel/${chanelSlug}/variant/${variantId}/content/`
    : `${base}/channel/${chanelSlug}/variant/${variantId}/content/${qp}`;

  const resp = await fetchClient.patch(url, payload);
  return resp.data;
};

export const useUpdateVariantContent = ({
  templateSlug,
  chanelSlug,
  variantId,
}: UseVariantDetailsParams) => {
  const { locale, tenantId, workspaceUid, conditions, isPrivate, version } =
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
        version,
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
  version,
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
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/mock_data/${qp}`;

  const resp = await fetchClient.get(url);
  return resp.data;
};

const getPreCommitValidate = async ({
  templateSlug,
  workspaceUid,
  isPrivate,
  version,
}: {
  templateSlug: string;
  workspaceUid: string;
  isPrivate: boolean;
  version?: string;
}) => {
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/pre_commit_validate/`;
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
  const { workspaceUid, isPrivate, version } = useTemplateEditorContext();
  return useQuery({
    queryKey: [`template/${templateSlug}/pre_commit_validate`, version],
    queryFn: () =>
      getPreCommitValidate({ templateSlug, workspaceUid, isPrivate, version }),
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
    version,
  } = useTemplateEditorContext();
  return useQuery({
    queryKey: [`template/${templateSlug}/mock_data`, mode, version],
    queryFn: () =>
      getMockData({
        templateSlug,
        workspaceUid,
        tenantId,
        isPrivate,
        recipientDistinctId,
        actorDistinctId,
        mode,
        version,
      }),
  });
};

const getSMSHeaders = async ({
  workspaceUid,
  notifCategory,
}: {
  workspaceUid: string;
  notifCategory: string;
}) => {
  const url = `${API_BASE_URL}/v1/${workspaceUid}/tenant/default/vendor/sms_headers/?root_category=${notifCategory}`;
  const resp = await fetchClient.get(url);
  return resp.data;
};

export const useSMSHeaders = (notifCategory: string) => {
  const { workspaceUid } = useTemplateEditorContext();

  return useQuery({
    queryKey: [
      `${workspaceUid}/tenant/default/vendor/sms_headers`,
      notifCategory,
    ],
    queryFn: () => getSMSHeaders({ workspaceUid, notifCategory }),
    enabled: !!notifCategory,
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
  const resp = await fetchClient.get(url);
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
  version,
}: CommitTemplateParams) => {
  const qp = createQueryParams({ commit_message: commitMessage });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/commit/${qp}`;

  const resp = await fetchClient.patch(url, { variants });
  return resp.data;
};

export const useCommitTemplate = ({
  templateSlug,
}: UseCommitTemplateParams) => {
  const { workspaceUid, isPrivate, version } = useTemplateEditorContext();
  return useMutation({
    mutationFn: ({ commitMessage, variants }: CommitTemplateMutationPayload) =>
      commitTemplate({
        templateSlug,
        workspaceUid,
        isPrivate,
        commitMessage,
        variants,
        version,
      }),
  });
};

// ---------- Channel Variant Mock Test ----------

const channelVariantMockTest = async ({
  workspaceUid,
  templateSlug,
  channel,
  variantId,
  payload,
  mode,
  isPrivate,
  version,
  conditions,
  locale,
  tenantId,
}: ChannelVariantMockTestParams) => {
  const qp = createQueryParams({
    mode,
    conditions,
    locale,
    tenant_id: tenantId,
  });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/channel/${channel}/variant/${variantId}/mock_test/${qp}`;
  const resp = await fetchClient.post(url, payload);
  return resp.data;
};

export const useChannelVariantMockTest = () => {
  const {
    workspaceUid,
    mode,
    isPrivate,
    version,
    conditions,
    locale,
    tenantId,
  } = useTemplateEditorContext();
  return useMutation({
    mutationFn: ({
      templateSlug,
      channel,
      variantId,
      payload,
    }: {
      templateSlug: string;
      channel: string;
      variantId: string;
      payload: MockTestPayload;
    }) =>
      channelVariantMockTest({
        workspaceUid,
        templateSlug,
        channel,
        variantId,
        payload,
        mode,
        isPrivate,
        version,
        conditions,
        locale,
        tenantId,
      }),
  });
};
