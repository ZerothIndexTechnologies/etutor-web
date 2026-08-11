import {Injectable} from '@angular/core';
import {
  ValidatorFn,
  UntypedFormGroup,
  ValidationErrors, FormGroup, FormControl, FormArray,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})

export class CustomValidationService {
  public maxValue(min: string | number, max: string | number): any {
    return (formGroup: UntypedFormGroup) => {
      const minControl = formGroup.controls[min];
      const maxControl = formGroup.controls[max];
      if (minControl.value && maxControl.value) {
        if (Number(minControl.value) > Number(maxControl.value)) {
          return {maxError: true};
        }
        return null;
      } else {
        return null;
      }
    };
  }

  public atLeastOneFieldValidator =
    (validator: ValidatorFn) =>
      (group: UntypedFormGroup): ValidationErrors | null => {
        const hasAtLeastOne =
          group &&
          group.controls &&
          Object.keys(group.controls).some((k) => !validator(group.controls[k]));
        return hasAtLeastOne
          ? null
          : {
            atLeastOne: true,
          };
      };

  numberOnly(event: any) {
    if (event.charCode !== 0) {
      const pattern = /[0-9]/;
      const inputChar = String.fromCharCode(event.charCode);
      if (!pattern.test(inputChar)) {
        event.preventDefault();
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup | FormArray) {
    if (formGroup instanceof FormGroup) {
      Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched({onlySelf: true});
        } else if (control instanceof FormGroup) {
          this.validateAllFormFields(control);
        } else if (control instanceof FormArray) {
          control.controls.forEach((ctrl: any) => {
            this.validateAllFormFields(ctrl);
          });
        }
      });
    } else {
      { // Handle FormArray case
        formGroup.controls.forEach((ctrl: any) => {
          this.validateAllFormFields(ctrl);
        });
      }
    }
  }
}
