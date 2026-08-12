import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-live-classroom-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-classroom-modal.component.html',
  styleUrl: './live-classroom-modal.component.scss'
})
export class LiveClassroomModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() roomName: string = '';
  @Input() roomTitle: string = '';
  @Input() userName: string = '';
  @Input() isTeacher: boolean = false;
  @Input() meetingLink: string = '';
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;

  private api: any = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        setTimeout(() => this.initJitsi(), 100);
      } else {
        this.destroyJitsi();
      }
    }
  }

  private initJitsi(): void {
    this.destroyJitsi();

    if (!this.roomName) return;

    if (typeof JitsiMeetExternalAPI === 'undefined') {
      console.error('JitsiMeetExternalAPI is not loaded. Ensure script is included in index.html.');
      return;
    }

    const domain = 'meet.jit.si';
    const container = this.jitsiContainer?.nativeElement;

    if (!container) return;

    const options = {
      roomName: this.roomName,
      width: '100%',
      height: '100%',
      parentNode: container,
      userInfo: {
        displayName: (this.userName || (this.isTeacher ? 'Teacher Host' : 'Student')) + (this.isTeacher ? ' (Host)' : '')
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        enableLobby: false,
        disableLobby: true,
        lobby: {
          enabled: false,
          autoKnock: false,
          enableLobbyChat: false
        },
        hideLobbyButton: true,
        enableUserRolesBasedOnToken: false,
        whiteboard: {
          enabled: true
        }
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'whiteboard', 'chat', 'raisehand',
          'tileview', 'fullscreen', 'hangup', 'settings'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#1e293b'
      }
    };

    try {
      this.api = new JitsiMeetExternalAPI(domain, options);

      this.api.addEventListener('videoConferenceJoined', (event: any) => {
        console.log('Video conference joined', event);
        if (this.isTeacher && this.api) {
          try {
            this.api.executeCommand('toggleLobby', false);
          } catch (e) {
            console.log('Lobby toggle ignored', e);
          }
        }
      });

      this.api.addEventListener('readyToClose', () => {
        this.closeModal();
      });

      this.api.addEventListener('videoConferenceLeft', () => {
        this.closeModal();
      });
    } catch (err) {
      console.error('Error initializing Jitsi Meet API:', err);
    }
  }

  public closeModal(): void {
    this.destroyJitsi();
    this.onClose.emit();
  }

  private destroyJitsi(): void {
    if (this.api) {
      try {
        this.api.dispose();
      } catch (e) {
        console.warn('Error disposing Jitsi API', e);
      }
      this.api = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyJitsi();
  }
}
