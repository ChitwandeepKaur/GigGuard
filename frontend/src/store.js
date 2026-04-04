import { create } from 'zustand'

export const useStore = create((set) => ({
  policyText: '',
  setPolicyText: (text) => set({ policyText: text }),
  clearPolicyText: () => set({ policyText: '' }),
}))
