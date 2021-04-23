import {
    observable,
    makeObservable,
    action,
    runInAction,
    computed,
} from 'mobx';

import { InvitationsService } from './invitations.service';
import { ProfilesService, ProfilesStore } from '@holochain-open-dev/profiles';

import { AgentPubKey, HeaderHash, Invitation } from './types';


export class InvitationsStore {


    //MODIFICAR LOS TIPOS A DICCIONARIOS (invitation pending)

    @observable
    public receivedInvitations: Invitation[] = [];

    @observable
    public sentInvitations: Invitation[] = [];


    @observable 
    public Invitees: AgentPubKey[] = [];


    constructor(
        protected invitationsService: InvitationsService,
        public profilesStore: ProfilesStore
      ) {
        makeObservable(this);
      }

    @action
    public async AddInvitee(agent_pub_key:AgentPubKey): Promise<void> {

    const invitees = [...this.Invitees, agent_pub_key];

        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render
            this.Invitees = invitees;
        });
    }

    @action
    public async RemoveInvitee(agent_pub_key:AgentPubKey): Promise<void> {

    const invitees = this.Invitees.filter((invitee)=> invitee != agent_pub_key);

        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render
            this.Invitees = invitees;
        });
    }
  
    @action
    public async fetchMyReceivedInvititations(): Promise<void> {
        // Pedir al backend
        const received_invitations: Invitation[] = await this.invitationsService.getReceivedInvitations();

        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render
            this.receivedInvitations = received_invitations;
        });
    }

    @action
    public async fectMySentInvitations(): Promise<void> {
        // Pedir al backend
        const sent_invitations: Invitation[] = await this.invitationsService.getSentInvitations();

        runInAction(() => {
            // Actualizar los datos dentro del runInAction para hacer trigger del render
            this.receivedInvitations = sent_invitations;
        });
    }

    @action 
    public async sendInvitation(guest: AgentPubKey){
        const create_invitation = await this.invitationsService.SendInvitation(guest);
        runInAction(async ()=>{
            await this.fectMySentInvitations();
        })
    }

    @action async acceptInvitation(invitation_header_hash: HeaderHash){
        const accept_invitation = await this.invitationsService.acceptInvitation(invitation_header_hash);

        runInAction(async ()=>{
            await this.fetchMyReceivedInvititations();
        })

    }    
    @action 
    async rejectInvitation(invitation_header_hash: HeaderHash){
        const reject_invitation = await this.invitationsService.rejectInvitation(invitation_header_hash);

        runInAction(async ()=>{
            await this.fetchMyReceivedInvititations();
        })

    }
}