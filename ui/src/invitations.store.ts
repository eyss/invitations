import { Dictionary, ProfilesService, ProfilesStore } from '@holochain-open-dev/profiles';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { InvitationsService } from './invitations.service';
import { Invitation } from './types';

export class InvitationsStore {
  @observable
  public receivedInvitations: Dictionary<Invitation> = {};
  @observable
  public sentInvitations: Dictionary<Invitation> = {};

  constructor(
    protected invitiationService: InvitationsService,
    public profilesStore: ProfilesStore
  ) {
    makeObservable(this);
  }

  async fetchMyReceivedInvititations(): Promise<void> {
    // Pedir al backend
    runInAction(() => {
      // Actualizar los datos dentro del runInAction para hacer trigger del render

//      this.receivedInvitations[asdf] = {};
    });
  }
}
