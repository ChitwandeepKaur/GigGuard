import { create } from 'zustand'

export const useStore = create((set) => ({
  policyText: '',
  policySummary: null,
  setPolicyText: (text) => set({ policyText: text }),
  setPolicySummary: (summary) => set({ policySummary: summary }),
  clearPolicyText: () => set({ policyText: '', policySummary: null }),
}))
