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
    invitationReceived(signal:any){

        console.log("Signal: received");
        const invitation = signal.payload.InvitationReceived;
        runInAction(async ()=>{
            this.invitations[invitation.invitation_entry_hash] = invitation;
        })
            
    }
    @action 
    invitationAccepted(signal:any){
        console.log("Signal: accepted");
        const invitation = signal.payload.InvitationAccepted;
        runInAction(async ()=>{

            console.log(this.invitations[invitation.invitation_entry_hash]);
            this.invitations[invitation.invitation_entry_hash] = invitation;
        });

    }
    
    @action 
    invitationRejected(signal:any){
        console.log("Signal: rejected" );
        const invitation = signal.payload.InvitationRejected;

        runInAction(async ()=>{
            this.invitations[invitation.invitation_entry_hash] = invitation;
        });
    }



    @action
    async signalHandler(signal:any){

        switch(signal.data.payload.name){

            case "invitation received":
                this.invitationReceived(signal.data.payload);
                break;
           
            case "invitation accepted":
                this.invitationAccepted(signal.data.payload);
                break;            
            
            case "invitation updated":
                break;

            case "invitation rejected":
                this.invitationRejected(signal.data.payload);
                break;

            default:
                break;
        }

        console.log(signal.data.payload.payload);

    }
};