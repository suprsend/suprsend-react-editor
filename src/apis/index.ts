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
  BaseApiParams,
} from '@/types';
import { createQueryParams } from '@/lib/utils';
import { useTemplateEditorContext } from '@/lib/TemplateEditorContext';
import { useQuery } from '@/lib/useQuery';
import { useMutation } from '@/lib/useMutation';
import { FetchClient } from '@/lib/fetchClient';
import { invalidateQueries } from '@/lib/queryCache';
export { invalidateQueries };
export { isHttpError } from '@/lib/fetchClient';

const API_BASE_URL = 'https://stagingapi2.suprsend.com';
const JSONNET_API_BASE_URL = 'https://stagingapi.suprsend.com/jsonnet';

export const fetchClient = new FetchClient({
  baseURL: API_BASE_URL,
  credentials: 'include',
});

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

// variant details api
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
  recipientDistinctId,
  actorDistinctId,
  fallbackVariantId,
}: GetVariantDetailsParams) => {
  const qp = isPrivate
    ? createQueryParams({ mode })
    : createQueryParams({
        tenant_id: tenantId,
        locale,
        conditions,
        recipient_distinct_id: recipientDistinctId,
        actor_distinct_id: actorDistinctId,
        mode,
        variant_id: variantId,
        fallback_variant_id: fallbackVariantId,
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
    recipientDistinctId,
    actorDistinctId,
    fallbackVariantId,
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
        recipientDistinctId,
        actorDistinctId,
        fallbackVariantId,
      }),
  });
};

// update variant details api
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
  recipientDistinctId,
  actorDistinctId,
  fallbackVariantId,
}: UpdateVariantContentParams) => {
  const qp = isPrivate
    ? ''
    : createQueryParams({
        tenant_id: tenantId,
        locale,
        conditions,
        recipient_distinct_id: recipientDistinctId,
        actor_distinct_id: actorDistinctId,
        variant_id: variantId,
        fallback_variant_id: fallbackVariantId,
      });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/channel/${chanelSlug}/variant/${variantId}/content/${qp}`;

  const resp = await fetchClient.patch(url, payload);
  return resp.data;
};

export const useUpdateVariantContent = ({
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
    version,
    recipientDistinctId,
    actorDistinctId,
    fallbackVariantId,
  } = useTemplateEditorContext();

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
        recipientDistinctId,
        actorDistinctId,
        fallbackVariantId,
      }),
  });
};

// get mock data api
const getMockData = async ({
  templateSlug,
  workspaceUid,
  tenantId,
  recipientDistinctId,
  actorDistinctId,
  isPrivate,
  mode,
  version,
  variantId,
  fallbackVariantId,
  locale,
  conditions,
}: GetMockDataParams) => {
  let queryObject: MockDataQueryParams = {};

  if (!isPrivate) {
    queryObject = {
      tenant_id: tenantId,
      recipient_distinct_id: recipientDistinctId,
      actor_distinct_id: actorDistinctId,
      variant_id: variantId,
      fallback_variant_id: fallbackVariantId,
      locale,
      conditions,
    };
  }

  const qp = createQueryParams({ ...queryObject, mode });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/mock_data/${qp}`;

  const resp = await fetchClient.get(url);
  return resp.data;
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
    variantId,
    fallbackVariantId,
    locale,
    conditions,
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
        variantId,
        fallbackVariantId,
        locale,
        conditions,
      }),
  });
};

// precommit validation api
const getPreCommitValidate = async ({
  templateSlug,
  workspaceUid,
  isPrivate,
  version,
  variantId,
  fallbackVariantId,
  tenantId,
  locale,
  conditions,
  recipientDistinctId,
  actorDistinctId,
  mode,
  channel,
}: BaseApiParams & { channel?: string | null }) => {
  const qp = isPrivate
    ? createQueryParams({ mode })
    : createQueryParams({
        tenant_id: tenantId,
        locale,
        conditions,
        recipient_distinct_id: recipientDistinctId,
        actor_distinct_id: actorDistinctId,
        mode,
        variant_id: variantId,
        fallback_variant_id: fallbackVariantId,
      });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/pre_commit_validate/${qp}`;
  const body = !isPrivate
    ? { variants: [{ id: variantId, channel }] }
    : undefined;
  const resp = await fetchClient.post(url, body);
  return resp.data;
};

export const usePreCommitValidate = ({
  templateSlug,
  enabled,
}: {
  templateSlug: string;
  enabled: boolean;
}) => {
  const {
    workspaceUid,
    isPrivate,
    version,
    variantId,
    fallbackVariantId,
    tenantId,
    locale,
    conditions,
    recipientDistinctId,
    actorDistinctId,
    mode,
    selectedChannel,
  } = useTemplateEditorContext();
  return useQuery({
    queryKey: [`template/${templateSlug}/pre_commit_validate`, version],
    queryFn: () =>
      getPreCommitValidate({
        templateSlug,
        workspaceUid,
        isPrivate,
        version,
        variantId,
        fallbackVariantId,
        tenantId,
        locale,
        conditions,
        recipientDistinctId,
        actorDistinctId,
        mode,
        channel: selectedChannel,
      }),
    enabled,
  });
};

// commit template
const commitTemplate = async ({
  templateSlug,
  workspaceUid,
  isPrivate,
  commitMessage,
  variants,
  version,
  variantId,
  fallbackVariantId,
  tenantId,
  locale,
  conditions,
  recipientDistinctId,
  actorDistinctId,
  mode,
  channel,
}: CommitTemplateParams & { channel?: string | null }) => {
  const qp = isPrivate
    ? createQueryParams({ commit_message: commitMessage, mode })
    : createQueryParams({
        commit_message: commitMessage,
        tenant_id: tenantId,
        locale,
        conditions,
        recipient_distinct_id: recipientDistinctId,
        actor_distinct_id: actorDistinctId,
        mode,
        variant_id: variantId,
        fallback_variant_id: fallbackVariantId,
      });
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/commit/${qp}`;

  const body = !isPrivate
    ? { variants: [{ id: variantId, channel }] }
    : { variants };
  const resp = await fetchClient.patch(url, body);
  return resp.data;
};

export const useCommitTemplate = ({
  templateSlug,
}: UseCommitTemplateParams) => {
  const {
    workspaceUid,
    isPrivate,
    version,
    variantId,
    fallbackVariantId,
    tenantId,
    locale,
    conditions,
    recipientDistinctId,
    actorDistinctId,
    mode,
    selectedChannel,
  } = useTemplateEditorContext();
  return useMutation({
    mutationFn: ({ commitMessage, variants }: CommitTemplateMutationPayload) =>
      commitTemplate({
        templateSlug,
        workspaceUid,
        isPrivate,
        commitMessage,
        variants,
        version,
        variantId,
        fallbackVariantId,
        tenantId,
        locale,
        conditions,
        recipientDistinctId,
        actorDistinctId,
        mode,
        channel: selectedChannel,
      }),
  });
};

// test template
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
  recipientDistinctId,
  actorDistinctId,
  fallbackVariantId,
}: ChannelVariantMockTestParams) => {
  const qp = isPrivate
    ? createQueryParams({ mode })
    : createQueryParams({
        tenant_id: tenantId,
        locale,
        conditions,
        recipient_distinct_id: recipientDistinctId,
        actor_distinct_id: actorDistinctId,
        mode,
        variant_id: variantId,
        fallback_variant_id: fallbackVariantId,
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
    recipientDistinctId,
    actorDistinctId,
    fallbackVariantId,
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
        recipientDistinctId,
        actorDistinctId,
        fallbackVariantId,
      }),
  });
};

// upload file api
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

// sms template headers api
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

// inbox tags api
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

// vendor approval api
const getVendorsForApproval = async ({
  workspaceUid,
  channelSlug,
  tenantId,
}: {
  workspaceUid: string;
  channelSlug: string;
  tenantId: string;
}) => {
  const url = `${API_BASE_URL}/v1/${workspaceUid}/tenant/${tenantId}/vendor/${channelSlug}/for_template_approval/`;
  const resp = await fetchClient.get(url);
  return resp.data;
};

export const useVendorsForApproval = (channelSlug: string) => {
  const { workspaceUid, tenantId } = useTemplateEditorContext();
  const tenant = tenantId || 'default';

  return useQuery({
    queryKey: [
      `${workspaceUid}/tenant/${tenant}/vendor/${channelSlug}/for_template_approval`,
    ],
    queryFn: () =>
      getVendorsForApproval({ workspaceUid, channelSlug, tenantId: tenant }),
  });
};

// vendor approval api
export interface VendorApprovalPayload {
  approval_status: 'pending' | 'sent_for_approval' | 'approved' | 'rejected';
  vendor_slug: string;
  vendor_uid: string;
  vendor_template_name: string;
  vendor_template_id?: string;
  vendor_locale_code?: string;
  vendor_template_category?: string;
  comment?: string;
}

const startVendorApproval = async ({
  workspaceUid,
  templateSlug,
  channelSlug,
  variantId,
  isPrivate,
  version,
  payload,
}: {
  workspaceUid: string;
  templateSlug: string;
  channelSlug: string;
  variantId: string;
  isPrivate: boolean;
  version?: string;
  payload: VendorApprovalPayload;
}) => {
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const url = `${base}/channel/${channelSlug}/variant/${variantId}/vendor_approval/?mode=live`;
  const resp = await fetchClient.patch(url, payload);
  return resp.data;
};

export const useStartVendorApproval = ({
  templateSlug,
  channelSlug,
  variantId,
}: {
  templateSlug: string;
  channelSlug: string;
  variantId: string;
}) => {
  const { workspaceUid, isPrivate, version, mode } =
    useTemplateEditorContext();

  return useMutation({
    mutationFn: (payload: VendorApprovalPayload) =>
      startVendorApproval({
        workspaceUid,
        templateSlug,
        channelSlug,
        variantId,
        isPrivate,
        version,
        payload,
      }),
    onSuccess: () => {
      invalidateQueries([
        `template/${templateSlug}/channel/${channelSlug}/variant/${variantId}`,
        mode,
        version,
      ]);
    },
  });
};

// discard vendor approval api
const discardVendorApproval = async ({
  workspaceUid,
  templateSlug,
  channelSlug,
  variantId,
  isPrivate,
  version,
  payload,
}: {
  workspaceUid: string;
  templateSlug: string;
  channelSlug: string;
  variantId: string;
  isPrivate: boolean;
  version?: string;
  payload: { discard_comment: string };
}) => {
  const base = templateBasePath(workspaceUid, templateSlug, isPrivate, version);
  const modeParam = version ? '' : '?mode=live';
  const url = `${base}/channel/${channelSlug}/variant/${variantId}/discard/${modeParam}`;
  const resp = await fetchClient.patch(url, payload);
  return resp.data;
};

export const useDiscardVendorApproval = ({
  templateSlug,
  channelSlug,
  variantId,
}: {
  templateSlug: string;
  channelSlug: string;
  variantId: string;
}) => {
  const { workspaceUid, isPrivate, version, mode } =
    useTemplateEditorContext();

  return useMutation({
    mutationFn: (payload: { discard_comment: string }) =>
      discardVendorApproval({
        workspaceUid,
        templateSlug,
        channelSlug,
        variantId,
        isPrivate,
        version,
        payload,
      }),
    onSuccess: () => {
      invalidateQueries([
        `template/${templateSlug}/channel/${channelSlug}/variant/${variantId}`,
        mode,
        version,
      ]);
    },
  });
};

// jsonnet render api
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
