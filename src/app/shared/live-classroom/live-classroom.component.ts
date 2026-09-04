import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Urls } from '../services/urls';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-live-classroom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-classroom.component.html',
  styleUrls: ['./live-classroom.component.scss']
})
export class LiveClassroomComponent implements OnInit, OnDestroy {
  @Input() classId!: number;
  @Output() close = new EventEmitter<void>();

  @ViewChild('jitsiContainer', { static: false }) jitsiContainer!: ElementRef;

  loading: boolean = true;
  errorMessage: string = '';
  api: any = null;
  roomTitle: string = 'Live Classroom';
  isModerator: boolean = false;
  participantCount: number = 1;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.classId) {
      this.joinLiveClass();
    } else {
      this.errorMessage = 'Invalid Class ID provided.';
      this.loading = false;
    }
  }

  joinLiveClass(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.postService<any>({ class_id: this.classId }, Urls.joinLiveClass).subscribe({
      next: (response: any) => {
        if (response && response.IsSuccess && response.ResponseObject) {
          const data = response.ResponseObject;
          this.roomTitle = data.title || 'Live Classroom';
          this.isModerator = !!data.isModerator;
          this.initializeJaaS(data.appId, data.cleanRoom || data.roomName, data.jwt);
        } else {
          this.loading = false;
          this.errorMessage = (response && response.ErrorObject) ? response.ErrorObject : 'Failed to join live class. Please verify your subscription.';
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = (err && err.error && err.error.ErrorObject) 
          ? err.error.ErrorObject 
          : 'Unable to connect to live class server. Please check your active subscription and join time.';
        this.cdr.detectChanges();
      }
    });
  }

  private initializeJaaS(appId: string, roomName: string, jwt: string): void {
    const scriptUrl = `https://8x8.vc/${appId}/external_api.js`;

    this.loadExternalScript(scriptUrl)
      .then(() => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.embedJitsiMeeting(appId, roomName, jwt);
        }, 100);
      })
      .catch((err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load JaaS IFrame API script. Please check network connectivity.';
        this.cdr.detectChanges();
      });
  }

  private loadExternalScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof JitsiMeetExternalAPI !== 'undefined') {
        resolve();
        return;
      }
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }

  private embedJitsiMeeting(appId: string, roomName: string, jwt: string): void {
    if (!this.jitsiContainer || !this.jitsiContainer.nativeElement) {
      this.errorMessage = 'Jitsi container element not found.';
      return;
    }

    const domain = '8x8.vc';
    const fullRoomName = `${appId}/${roomName}`;

    const options = {
      roomName: fullRoomName,
      jwt: jwt,
      parentNode: this.jitsiContainer.nativeElement,
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: !this.isModerator,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        enableEndConference: this.isModerator,
        fileRecordingsEnabled: false,
        liveStreamingEnabled: false,
        localRecording: {
          enabled: false
        },
        enableLobby: true,
        autoKnockLobby: true
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting',
          'fullscreen', 'fudiagnostics', 'hangup', 'chat', 'participants-pane',
          'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'select-background', 'download', 'help', 'mute-everyone', 'security', 'end-conference'
        ]
      }
    };

    try {
      this.api = new JitsiMeetExternalAPI(domain, options);

      this.api.addEventListener('videoConferenceJoined', (participant: any) => {
        console.log('Joined JaaS Live Classroom:', participant);
        this.updateParticipantCount();
      });

      this.api.addEventListener('participantJoined', () => {
        this.updateParticipantCount();
      });

      this.api.addEventListener('participantLeft', () => {
        this.updateParticipantCount();
      });

      this.api.addEventListener('videoConferenceLeft', () => {
        console.log('Left JaaS Live Classroom');
        this.closeClassroom();
      });

      this.api.addEventListener('readyToClose', () => {
        this.closeClassroom();
      });
    } catch (e: any) {
      this.errorMessage = 'Failed to initialize JaaS Classroom: ' + (e.message || e);
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

  endClassForEveryone(): void {
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
          next: () => this.closeClassroom(),
          error: () => this.closeClassroom()
        });
      } else {
        this.closeClassroom();
      }
    }
  }

  closeClassroom(): void {
    if (this.api) {
      try {
        this.api.dispose();
      } catch (e) {}
      this.api = null;
    }
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.api) {
      try {
        this.api.dispose();
      } catch (e) {}
    }
  }
}
