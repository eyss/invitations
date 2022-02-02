import { Context, createContext } from '@holochain-open-dev/context';
import { InvitationsStore } from './state/invitations-store';

export const invitationsStoreContext: Context<InvitationsStore> = createContext(
  'hc_zome_invitations/store'
);
