import { defineStore } from 'pinia';
// Define User and Role types
interface Role {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  displayName: string;
  deletedAt: string | null;
}

export interface Customer {
  createdAt: string;
  updatedAt: string;
  id: string;
  name: string | null;
  phoneNumber: string;
  npwp: string | null;
  userId: string;
}

interface User {
  id: string;
  email: string;
  roleId: string;
  role: Role;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  accessToken: string | null;
  user: User | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    accessToken: null as string | null, // Persisted in localStorage
    user: null as User | null, // Persisted in localStorage
  }),
  actions: {
    setAccessToken(token: string) {
      this.accessToken = token;
    },
    setUser(user: User) {
      this.user = user;
    },
    clearUser() {
      this.accessToken = '';
      this.user = null;
    },
  },
  persist: {
    key: 'user-storage',
    storage: piniaPluginPersistedstate.localStorage()
  }
});
