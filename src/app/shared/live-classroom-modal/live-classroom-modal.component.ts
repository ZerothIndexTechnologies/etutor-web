import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Urls } from '../services/urls';

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
  @Input() classId: number | null = null;
  @Input() roomName: string = '';
  @Input() roomTitle: string = '';
  @Input() userName: string = '';
  @Input() isTeacher: boolean = false;
  @Input() meetingLink: string = '';
  @Output() onClose = new EventEmitter<void>();

  @ViewChild('jitsiContainer') jitsiContainer!: ElementRef;

  public loading: boolean = true;
  public errorMessage: string = '';
  public participantCount: number = 1;
  private api: any = null;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.fetchJwtAndInit();
      } else {
        this.destroyJitsi();
      }
    }
  }

  public jaasDirectUrl: string = '';

  private fetchJwtAndInit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    if (!this.classId) {
      // Fallback if classId not passed directly but roomName exists
      this.errorMessage = 'Class ID missing for secure JWT initialization.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.authService.postService<any>({ class_id: this.classId }, Urls.joinLiveClass).subscribe({
      next: (res: any) => {
        if (res && res.IsSuccess && res.ResponseObject) {
          const data = res.ResponseObject;
          this.roomTitle = data.title || this.roomTitle || 'Live Classroom';
          this.isTeacher = !!data.isModerator;
          this.jaasDirectUrl = `https://8x8.vc/${data.appId}/${data.cleanRoom || data.roomName}?jwt=${data.jwt}`;
          this.initJaasIFrame(data.appId, data.cleanRoom || data.roomName, data.jwt);
        } else {
          this.loading = false;
          this.errorMessage = (res && res.ErrorObject) ? res.ErrorObject : 'Unable to join live class. Active subscription required.';
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = (err && err.error && err.error.ErrorObject)
          ? err.error.ErrorObject
          : 'Could not connect to backend authorization server.';
        this.cdr.detectChanges();
      }
    });
  }

  public openInNewTab(): void {
    if (this.jaasDirectUrl) {
      window.open(this.jaasDirectUrl, '_blank');
      this.closeModal();
    }
  }

  private initJaasIFrame(appId: string, roomName: string, jwt: string): void {
    const scriptUrl = `https://8x8.vc/${appId}/external_api.js`;

    this.loadScript(scriptUrl)
      .then(() => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.embedJitsi(appId, roomName, jwt), 100);
      })
      .catch(() => {
        this.loading = false;
        this.errorMessage = 'Failed to load 8x8 JaaS External API script.';
        this.cdr.detectChanges();
      });
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof JitsiMeetExternalAPI !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  }

  private embedJitsi(appId: string, roomName: string, jwt: string): void {
    this.destroyJitsi();

    const container = this.jitsiContainer?.nativeElement;
    if (!container) return;

    const domain = '8x8.vc';
    const fullRoomName = `${appId}/${roomName}`;

    const options = {
      roomName: fullRoomName,
      jwt: jwt,
      width: '100%',
      height: '100%',
      parentNode: container,
      configOverwrite: {
        startWithAudioMuted: !this.isTeacher,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableEndConference: this.isTeacher,
        fileRecordingsEnabled: false,
        liveStreamingEnabled: false,
        localRecording: {
          enabled: false
        },
        enableLobby: true,
        autoKnockLobby: true
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'chat', 'raisehand', 'participants-pane',
          'tileview', 'fullscreen', 'hangup', 'settings', 'end-conference'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#0f172a'
      }
    };

    try {
      this.api = new JitsiMeetExternalAPI(domain, options);

      this.api.addEventListener('videoConferenceJoined', () => {
        this.updateParticipantCount();
      });

      this.api.addEventListener('participantJoined', () => {
        this.updateParticipantCount();
      });

      this.api.addEventListener('participantLeft', () => {
        this.updateParticipantCount();
      });

      this.api.addEventListener('readyToClose', () => {
        this.closeModal();
      });

      this.api.addEventListener('videoConferenceLeft', () => {
        this.closeModal();
      });
    } catch (err: any) {
      this.errorMessage = 'Error initializing JaaS Classroom: ' + (err.message || err);
      this.cdr.detectChanges();
    }
  }

  private updateParticipantCount(): void {
    if (this.api) {
      try {
        const num = this.api.getNumberOfParticipants();
        if (num !== undefined && num !== null) {
          this.participantCount = num;
          this.cdr.detectChanges();
        }
      } catch (e) {}
    }
  }

  public endClassForEveryone(): void {
    if (confirm('Are you sure you want to end this live class session for all participants?')) {
      if (this.api) {
        try {
          this.api.executeCommand('endConference');
        } catch (e) {
          try {
            this.api.executeCommand('hangup');
          } catch (err) {}
        }
      }
      if (this.classId) {
        this.authService.postService<any>(
          { class_id: this.classId, status: 'COMPLETED' },
          Urls.updateLiveClassStatus
        ).subscribe({
          next: () => this.closeModal(),
          error: () => this.closeModal()
        });
      } else {
        this.closeModal();
      }
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
      } catch (e) {}
      this.api = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyJitsi();
  }
}
