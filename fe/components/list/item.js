import { html, render } from 'https://dev.jspm.io/lit-html';
import Component from '../../lib/component.js';
import { store } from '../../models/index.js';
import { secondToMinute } from '../../utils/datetime.js';
import AppMenu from '../menu/index.js';
import { del, update } from '../../services/song.js';
import '../ripple/index.js';
import Modal from '../modal/index.js';

customElements.define(
  'list-item',
  class extends Component {
    static get observedAttributes() {
      return ['id', 'updatedat'];
    }

    constructor() {
      super();
      this.clickHandle = this.clickHandle.bind(this);
      this.editHandle = this.editHandle.bind(this);
    }

    clickHandle(e) {
      const { x, y } = e;
      this.classList.add('hover');
      AppMenu.instance.setState({
        position: { x, y },
        list: [
          {
            text: 'edit',
            handle: this.editHandle,
          },
          {
            text: 'delete',
            handle: () => del(Number(this.id)),
          },
        ],
        closeCallback: () => this.classList.remove('hover'),
      });
      e.stopPropagation();
    }

    editHandle() {
      const { list } = store.songData;
      const song = list.find(e => String(e.id) === this.id);
      const form = document.createElement('form');
      render(
        html`
          <style>
            input {
              box-sizing: border-box;
              display: block;
              width: 100%;
              margin-bottom: 1em;
              font: inherit;
            }
          </style>
          <label>
            <span>title</span>
            <input name="title" value="${song.title}">
          </label>
          <label>
            <span>artist</span>
          <input name="artist" value="${song.artist || ''}">
          </label>
          <label>
            <span>album</span>
          <input name="album" value="${song.album || ''}">
          </label>
        `,
        form,
      );
      const oncomplete = () => {
        update(Number(this.id), {
          title: form.title.value,
          artist: form.artist.value,
          album: form.album.value,
        });
      };
      Modal.open({
        title: 'edit music info',
        complete: 'ok',
        cancel: 'cancel',
        template: form,
        onclose: null,
        oncomplete,
        oncancel: null,
      });
    }

    render() {
      const { list } = store.songData;
      const song = list.find(e => String(e.id) === this.id) || {};
      return html`
        <style>
          :host {
            display: flex;
            transition: background-color .3s;
          }
          :host(:hover),
          :host(.hover) {
            background: var(--list-hover-background-color);
          }
          :host([active]) {
            --list-item-playing-color: var(--theme-color);
          }
          .info {
            flex-grow: 1;
          }
          .title {
            color: var(--list-item-playing-color);
            fill: var(--list-item-playing-color);
          }
          ::slotted(app-icon:not([hidden])) {
            vertical-align: middle;
            margin: -.6rem 0 -.4rem -.5rem;
          }
          .name {
            margin-top: .25em;
          }
          .name:blank {
            display: none;
          }
          .name,
          .duration {
            font-size: .875em;
            color: var(--list-text-secondary-color);
          }
          .more {
            display: none;
          }
          :host(:hover) .more,
          :host(.hover) .more {
            display: block;
          }
          .more app-icon {
            margin-top: -.2rem;
          }
          .more,
          .duration {
            min-width: 4rem;
            padding-left: .75rem;
            text-align: right;
          }
          .duration {
            padding-top: .125em;
            color: var(--list-item-playing-color);
          }
        </style>
        <div class="info">
          <div class="title">
            <slot></slot>
            ${song.title}
          </div>
          <div class="name">${song.artist || 'unknown'}</div>
        </div>
        <div class="more">
          <app-icon @click="${this.clickHandle}" name="more-horiz">
            <app-ripple circle></app-ripple>
          </app-icon>
        </div>
        <div class="duration">
          ${secondToMinute(song.duration)}
        </div>
    `;
    }
  },
);
