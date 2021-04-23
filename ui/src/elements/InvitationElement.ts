import { html, css, LitElement, property } from 'lit-element';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';


export abstract class CreateInvitation extends MobxReactionUpdate(BaseElement) implements DepsElement<InvitationsStore> {
  
  abstract get _deps(): InvitationsStore;

  render() {

    return html`
      <search-agents></search-agents>
      <mwc-button raised>Hello</mwc-button>

      <mwc-list activatable>
            <mwc-list-item hasMeta>
              <span>Location A</span>
              <mwc-button slot = "meta">Hello</mwc-button>
            </mwc-list-item>
          <mwc-list-item selected activated>Item 1</mwc-list-item>
          <mwc-list-item>Item 2</mwc-list-item>
          <mwc-list-item>Item 3</mwc-list-item>
      </mwc-list>

      <h1>Hello World</h1>
      <list-profiles></list-profiles>
    `;
  }

  getScopedElements() {
    return {
      'search-agents': connectDeps(SearchAgent, this._deps.profilesStore),
      'mwc-button': Button,
      'mwc-list': List,
      'mwc-list-item':ListItem,

      'list-profiles': connectDeps(ListProfiles, this._deps.profilesStore),
    };
  }
}
