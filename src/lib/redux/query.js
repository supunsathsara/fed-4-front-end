import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: "api",
  tagTypes: ['Anomalies', 'AnomalyStats', 'AdminAnomalies', 'AdminAnomalyStats', 'Invoices', 'InvoiceCounts'],
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl, prepareHeaders: async (headers) => {
    const clerk = window.Clerk;
    if (clerk) {
      const token = await clerk.session.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    return headers;
  } }),
  endpoints: (build) => ({
    getEnergyGenerationRecordsBySolarUnit: build.query({
      query: ({id, groupBy, limit}) => `/energy-generation-records/solar-unit/${id}?groupBy=${groupBy}&limit=${limit}`,
    }),
    getSolarUnitForUser: build.query({
      query: () => `/solar-units/me`,
    }),
    getSolarUnits: build.query({
      query: () => `/solar-units`,
    }),
    getSolarUnitById: build.query({
      query: (id) => `/solar-units/${id}`,
    }),
    createSolarUnit: build.mutation({
      query: (data) => ({
        url: `/solar-units`,
        method: "POST",
        body: data,
      }),
    }),
    editSolarUnit: build.mutation({
      query: ({id, data}) => ({
        url: `/solar-units/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    getAllUsers: build.query({
      query: () => `/users`,
    }),
    getCurrentUser: build.query({
      query: () => `/users/me`,
    }),
    getWeatherData: build.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.lat) searchParams.append('lat', params.lat);
        if (params?.lon) searchParams.append('lon', params.lon);
        return `/weather?${searchParams.toString()}`;
      },
    }),
    getCapacityFactor: build.query({
      query: ({solarUnitId, days}) => `/energy-generation-records/capacity-factor/${solarUnitId}?days=${days || 7}`,
    }),
    // Anomaly endpoints
    getMyAnomalies: build.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.type) searchParams.append('type', params.type);
        if (params?.severity) searchParams.append('severity', params.severity);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.limit) searchParams.append('limit', params.limit);
        return `/anomalies/my?${searchParams.toString()}`;
      },
      providesTags: ['Anomalies'],
    }),
    getMyAnomalyStats: build.query({
      query: () => `/anomalies/my/stats`,
      providesTags: ['AnomalyStats'],
    }),
    getAnomalyTypes: build.query({
      query: () => `/anomalies/types`,
    }),
    getAllAnomalies: build.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.type) searchParams.append('type', params.type);
        if (params?.severity) searchParams.append('severity', params.severity);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.limit) searchParams.append('limit', params.limit);
        if (params?.offset) searchParams.append('offset', params.offset);
        return `/anomalies?${searchParams.toString()}`;
      },
      providesTags: ['AdminAnomalies'],
    }),
    getAdminAnomalyStats: build.query({
      query: () => `/anomalies/stats`,
      providesTags: ['AdminAnomalyStats'],
    }),
    acknowledgeAnomaly: build.mutation({
      query: (anomalyId) => ({
        url: `/anomalies/${anomalyId}/acknowledge`,
        method: 'POST',
      }),
      invalidatesTags: ['Anomalies', 'AnomalyStats', 'AdminAnomalies', 'AdminAnomalyStats'],
    }),
    resolveAnomaly: build.mutation({
      query: ({ anomalyId, notes }) => ({
        url: `/anomalies/${anomalyId}/resolve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Anomalies', 'AnomalyStats', 'AdminAnomalies', 'AdminAnomalyStats'],
    }),
    markAnomalyFalsePositive: build.mutation({
      query: ({ anomalyId, notes }) => ({
        url: `/anomalies/${anomalyId}/false-positive`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Anomalies', 'AnomalyStats', 'AdminAnomalies', 'AdminAnomalyStats'],
    }),
    triggerAnomalyDetection: build.mutation({
      query: () => ({
        url: `/anomalies/trigger-detection`,
        method: 'POST',
      }),
      invalidatesTags: ['Anomalies', 'AnomalyStats', 'AdminAnomalies', 'AdminAnomalyStats'],
    }),
    // Invoice endpoints
    getInvoices: build.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.limit) searchParams.append('limit', params.limit);
        if (params?.offset) searchParams.append('offset', params.offset);
        return `/invoices?${searchParams.toString()}`;
      },
      providesTags: ['Invoices'],
    }),
    getInvoiceById: build.query({
      query: (id) => `/invoices/${id}`,
      providesTags: ['Invoices'],
    }),
    getPendingInvoiceCount: build.query({
      query: () => `/invoices/pending-count`,
      providesTags: ['InvoiceCounts'],
    }),
    getAdminInvoices: build.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.limit) searchParams.append('limit', params.limit);
        if (params?.offset) searchParams.append('offset', params.offset);
        return `/invoices/admin/all?${searchParams.toString()}`;
      },
      providesTags: ['Invoices'],
    }),
    triggerInvoiceGeneration: build.mutation({
      query: () => ({
        url: `/invoices/generate`,
        method: 'POST',
      }),
      invalidatesTags: ['Invoices', 'InvoiceCounts'],
    }),
    // Payment endpoints
    createPaymentSession: build.mutation({
      query: (invoiceId) => ({
        url: `/payments/create-checkout-session`,
        method: 'POST',
        body: { invoiceId },
      }),
    }),
    getSessionStatus: build.query({
      query: (sessionId) => `/payments/session-status?session_id=${sessionId}`,
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { 
  useGetAllUsersQuery,
  useGetCurrentUserQuery,
  useGetEnergyGenerationRecordsBySolarUnitQuery, 
  useGetSolarUnitForUserQuery, 
  useGetSolarUnitsQuery, 
  useGetSolarUnitByIdQuery, 
  useCreateSolarUnitMutation, 
  useEditSolarUnitMutation,
  useGetWeatherDataQuery,
  useGetCapacityFactorQuery,
  // Anomaly hooks
  useGetMyAnomaliesQuery,
  useGetMyAnomalyStatsQuery,
  useGetAnomalyTypesQuery,
  useGetAllAnomaliesQuery,
  useGetAdminAnomalyStatsQuery,
  useAcknowledgeAnomalyMutation,
  useResolveAnomalyMutation,
  useMarkAnomalyFalsePositiveMutation,
  useTriggerAnomalyDetectionMutation,
  // Invoice hooks
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetPendingInvoiceCountQuery,
  useGetAdminInvoicesQuery,
  useTriggerInvoiceGenerationMutation,
  // Payment hooks
  useCreatePaymentSessionMutation,
  useGetSessionStatusQuery,
} = api;