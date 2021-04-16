import { AppWebsocket, CellId } from '@holochain/conductor-api';

export class InvitationsService {
  constructor(
    public appWebsocket: AppWebsocket,
    public cellId: CellId,
    public zomeName = 'invitation'
  ) {}

  // Poner todas las funciones que el backend acepta

  private callZome(fn_name: string, payload: any) {
    return this.appWebsocket.callZome({
      cap: null as any,
      cell_id: this.cellId,
      zome_name: this.zomeName,
      fn_name: fn_name,
      payload: payload,
      provenance: this.cellId[1],
    });
  }
}
