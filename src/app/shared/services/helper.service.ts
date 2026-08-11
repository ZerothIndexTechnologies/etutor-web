import { Injectable } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  isLoading = false;
  constructor(public snackBar: MatSnackBar) {}
  // toaster
  public async presentToast(msg: any) {
    await this.snackBar.open(msg, '×', {
      panelClass: 'success',
      verticalPosition: 'top',
      duration: 3000
    });
  }

  public async presentErrorToast(msg: any) {
    await this.snackBar.open(msg, '×', {
      panelClass: 'error',
      verticalPosition: 'top',
      duration: 3000
    });
  }

  /// loader showing
  async showLoader() {
    // this.isLoading = true;
    // return await this.loadingCtrl
    //   .create({
    //     // duration: 5000,
    //     message: 'Please wait...',
    //   })
    //   .then(
    //     (a: { present: () => Promise<any>; dismiss: () => Promise<any> }) => {
    //       a.present().then(() => {
    //         if (!this.isLoading) {
    //           a.dismiss().then(() => console.log('abort presenting'));
    //         }
    //       });
    //     }
    //   );
  }

  /// loader hiding
  async hideLoader() {
    // this.isLoading = false;
    // const popover = await this.loadingCtrl.getTop();
    // if (popover) await popover.dismiss(null);
  }

  convertBase64PdfPath(b64Data: any) {
    const byteCharacters = atob(b64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    // const blob = new Blob([byteArray], {type: 'application/pdf'});
    return byteArray;
  }

  convertBase64(b64urlData: any) {
    if (b64urlData != '' && b64urlData.length != 0) {
      let b64Data: any;
      b64Data = atob(atob(atob(atob(b64urlData))));
      b64Data = JSON.parse(b64Data);
      return b64Data;
    } else {
      return b64urlData;
    }
  }
}
