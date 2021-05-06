import {
    observable,
    makeObservable,
    action,
    runInAction,
    computed,
} from 'mobx';

import { InvitationsService } from './invitations.service';
import { ProfilesService, ProfilesStore } from '@holochain-open-dev/profiles';

import { AgentPubKey, HeaderHash, Invitation, Dictionary, InvitationEntryInfo } from './types';

    const data: InvitationEntryInfo[] = [
      {
        invitation: {
          inviter: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
          invitees: [
            '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
            '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
          ],
          timestamp: '00:11',
        },

        invitation_entry_hash: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
        invitation_header_hash: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
        invitees_who_accepted: ['0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0'],
        invitees_who_rejected: ['0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0'],
      },
      {
        invitation: {
          inviter: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
          invitees: [
            '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
            '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
          ],
          timestamp: '00:00',
        },

        invitation_entry_hash: '0x4A26e382Ab282992d1BAEd09ce1a5E9E559D53C0',
        invitation_header_hash: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
        invitees_who_accepted: ['0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0','0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0'],
        invitees_who_rejected: [],
      },
      {
        invitation: {
          inviter: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
          invitees: [
            '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
            '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
          ],
          timestamp: '19:00',
        },

        invitation_entry_hash: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D628',
        invitation_header_hash: '0x4A26e382Ab282992d1BAEd09ce1a4f8E559D53C0',
        invitees_who_accepted: [],
        invitees_who_rejected: [],
      },
    ];



export class InvitationsStore {

    @observable
    public invitations: Dictionary<InvitationEntryInfo> = {}; 

    @observable
    public prueba: String = "Hola mundo"; 


    constructor(
        protected invitationsService: InvitationsService,
        public profilesStore: ProfilesStore
      ) {
        makeObservable(this);
      }
    

    @action
    public async fectMyPendingInvitations()  {  //Promise<void>
        // Pedir al backend
        const pending_invitations_entries_info: InvitationEntryInfo[] = await this.invitationsService.getMyPendingInvitations();

        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render
            // for (const invitation_entry_info of pending_invitations_entries_info) {
            //     this.invitations[invitation_entry_info.invitation_entry_hash] = invitation_entry_info;
            // }

            //temporal assignment of the values fo testing purposes 
            pending_invitations_entries_info.map((invitation_entry_info) =>{
                this.invitations[invitation_entry_info.invitation_entry_hash] = invitation_entry_info;
            });
        });







    }

    @action 
    public async sendInvitation(inviteesList: AgentPubKey[]){
        const create_invitation = await this.invitationsService.SendInvitation(inviteesList);
        
        runInAction(async ()=>{
            await this.fectMyPendingInvitations();
        })
    }

    @action async acceptInvitation(invitation_header_hash: HeaderHash){
        const accept_invitation = await this.invitationsService.acceptInvitation(invitation_header_hash);

        runInAction(async ()=>{
            await this.fectMyPendingInvitations();
        })

    }    
    @action 
    async rejectInvitation(invitation_header_hash: HeaderHash){
        const reject_invitation = await this.invitationsService.rejectInvitation(invitation_header_hash);

        runInAction(async ()=>{
            await this.fectMyPendingInvitations();
        })

    }
};