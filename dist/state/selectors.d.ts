import { AgentPubKeyB64 } from '@holochain-open-dev/core-types';
import { Invitation, InvitationEntryInfo, InvitationStatus } from '../types';
export declare function isInvitationCompleted(invitation: InvitationEntryInfo): boolean;
export declare function getInvitationStatus(invitation: InvitationEntryInfo): InvitationStatus;
export declare function getAllAgentsFor(invitation: Invitation): Array<AgentPubKeyB64>;
