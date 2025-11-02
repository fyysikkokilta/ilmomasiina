import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

import { AdminEventsSlice, adminEventsSlice } from "./adminEvents";
import { AdminUsersSlice, adminUsersSlice } from "./adminUsers";
import { AuditLogSlice, auditLogSlice } from "./auditLog";
import { AuthSlice, authSlice } from "./auth";
import { EditorSlice, editorSlice } from "./editor";

export type Root = {
  adminEvents: AdminEventsSlice;
  adminUsers: AdminUsersSlice;
  auditLog: AuditLogSlice;
  auth: AuthSlice;
  editor: EditorSlice;
};

const useStore = create<Root>()(
  devtools(
    persist(
      (...args) => ({
        adminEvents: adminEventsSlice(...args),
        adminUsers: adminUsersSlice(...args),
        auditLog: auditLogSlice(...args),
        auth: authSlice(...args),
        editor: editorSlice(...args),
      }),
      {
        name: DEV ? "ilmomasiina-dev" : "ilmomasiina",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ auth: state.auth }),
      },
    ),
  ),
);

export default useStore;
