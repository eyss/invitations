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
import { table } from 'console';

export class InvitationsStore {

    @observable
    public invitations: Dictionary<InvitationEntryInfo> = {}; 

    // @observable
    // public prueba: String = "Hola mundo"; 

    constructor(
        protected invitationsService: InvitationsService,
        public profilesStore: ProfilesStore
      ) {
        makeObservable(this);
      }
    

    @action
    public async fectMyPendingInvitations() {  //Promise<void>
        // Pedir al backend
        const pending_invitations_entries_info: InvitationEntryInfo[] = await this.invitationsService.getMyPendingInvitations();

        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render

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

    @action 
    async signalHandler(signal:any){



        runInAction(async ()=>{

            console.log("Hola");
    
            await this.fectMyPendingInvitations();
        })

    }
};