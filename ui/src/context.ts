import { Context, createContext } from '@lit-labs/context';
import { InvitationsStore } from './state/invitations-store';

export const invitationsStoreContext: Context<InvitationsStore> = createContext(
  'hc_zome_invitations/store'
);
