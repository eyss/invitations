import { html, css, LitElement, property } from 'lit-element';
import {
  BaseElement,
  connectDeps,
  DepsElement,
} from '@holochain-open-dev/common';
import { SearchAgent, ListProfiles } from '@holochain-open-dev/profiles';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { InvitationsStore } from '../invitations.store';
import { Button } from 'scoped-material-components/mwc-button';
import  {List} from 'scoped-material-components/mwc-list';
import  {ListItem} from 'scoped-material-components/mwc-list-item';

// <mwc-list>
//   <mwc-list-item>Item 0</mwc-list-item>
//   <mwc-list-item>Item 1</mwc-list-item>
//   <mwc-list-item>Item 2</mwc-list-item>
//   <mwc-list-item>Item 3</mwc-list-item>
// </mwc-list>
import { Invitation } from '../types';

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
