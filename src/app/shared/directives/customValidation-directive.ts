import {Directive, HostListener, Input, OnInit, Optional} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[appInputType]'
})

// tslint:disable-next-line:directive-class-suffix
export class InputTypeValidation implements OnInit {

  @Input() appInputType: string = '';
  @Input() appDecimalLength: number = 0;
  @Input() appInputLength: number = 0;
  @Input() appPeriodicVal: string = '';
  @Input() appInputMaxVal: string = '';
  regex: any = RegExp;
  maxValue: number = 0;
  private readonly specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'Shift', 'Control', 'Enter'];
  private readonly specialKeyCodes: Array<string> = ['ArrowLeft', 'ArrowRight'];
  private readonly dotKeyCodes: Array<number> = [46, 110, 190];
  numbers = 0;

  constructor(@Optional() private readonly ctrl: NgControl) {
  }

  @HostListener('paste', ['$event']) blockPaste(e: KeyboardEvent): void {
    e.preventDefault();
  }

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent): void {
    e.preventDefault();
  }

  @HostListener('cut', ['$event']) blockCut(e: KeyboardEvent): void {
    e.preventDefault();
  }

  ngOnInit(): void {
    if (this.appInputType !== '') {
      if (this.appInputType === 'numberWithDecimal') {
        this.regex = new RegExp('^[0-9]{0,13}([\.]{1}[0-9]{0,2})?$');
      } else {
        this.regexExpContinue();
      }
    } else {
      this.regex = new RegExp(/^[a-zA-Z0-9]*$/g);
    }
    if (this.appInputMaxVal !== '') {
      this.maxValue = Number(this.appInputMaxVal);
    }
  }

  regexExpContinue(): void {
    if (this.appInputType === 'onlyNumber') {
      this.regex = new RegExp(/^[0-9]*$/g);
    } else if (this.appInputType === 'alphaNumeric') {
      this.regex = new RegExp(/^[a-zA-Z0-9 ]*$/g);
    } else if (this.appInputType === 'alphaNumericWS') {
      this.regex = new RegExp(/^[a-zA-Z0-9]*$/g);
    } else if (this.appInputType === 'alphaNumericWithValSwift') {
      this.regex = new RegExp(/^[a-zA-Z0-9.,-/() ]*$/g);
    } else if (this.appInputType === 'alphaNumericWith_') {
      this.regex = new RegExp(/^[a-zA-Z0-9_]*$/g);
    } else if (this.appInputType === 'onlyCharacter') {
      this.regex = new RegExp(/^[a-zA-Z]*$/g);
    } else if (this.appInputType === 'onlyLowercase') {
      this.regex = new RegExp(/^[a-z]*$/g);
    } else if (this.appInputType === 'onlyUppercase') {
      this.regex = new RegExp(/^[A-Z]*$/g);
    } else if (this.appInputType === 'alphaNumericWithSpecial') {
      this.regex = new RegExp(/^[!@#$%^*&/.+\w\s ]*$/g);
    } else if (this.appInputType === 'commissionWithDecimal') {
      this.regex = new RegExp(/^([0-9]{0,2})+(\.[0-9]{0,2}){0,1}$/g);
    } else if (this.appInputType === 'numberWithDecimal') {
      this.regex = new RegExp('^[0-9]{0,13}([\.]{1}[0-9]{0,2})?$');
    } else if (this.appInputType === 'maxValue') {
      this.regex = new RegExp(/^[0-9]*\.?[0-9]{0,2}$/g);
      if (this.appInputMaxVal !== '') {
        this.maxValue = Number(this.appInputMaxVal);
      }
    }
    //SFL MCB customization - 6 decimal places
    else if (this.appInputType === 'numberWithDecimal6p') {
      this.regex = new RegExp('^[0-9]{0,13}([\.]{1}[0-9]{0,6})?$');
    }
  }

  @HostListener('input', ['$event.target.value', '$event'])
  onKeyDown(value: any, event: any) {
    const isDevice = event.code;
    const e = event as KeyboardEvent;
    if (isDevice) {
      // not a mobile
      this.notMobile(e, value, event);
    } else {
      // mobile
      // replace invalid value with valid.
      this.mobileDevice(e, event);
    }
  }

  notMobile(e: any, value: any, event: any): void {
    const keyUppercase = e.key.toUpperCase();
    if (this.specialKeys.indexOf(e.key) !== -1 ||
      // special keys allows which we specified in specialkeys
      keyUppercase === 'C' && (e.ctrlKey || e.metaKey) ||
      // Allow: Ctrl+C
      keyUppercase === 'V' && (e.ctrlKey || e.metaKey) ||
      // Allow: Ctrl+V
      keyUppercase === 'X' && (e.ctrlKey || e.metaKey) ||
      // Allow: Ctrl+X
      keyUppercase === 'A' && (e.ctrlKey || e.metaKey)
      // Allow: Ctrl+X
    ) {
      return;
    }
    // dom is not updated beacuse this is keydown event so user typed vaue and check with our regex
    const next: string = value.concat(event.key);
    if (next && !next.match(this.regex)) {
      event.preventDefault();
    }
  }

  mobileDevice(e: any, event: any): void {
    const numberVal = this.allowSpecificType(e);
    event.target.value = numberVal;
    if (this.ctrl && this.ctrl.control) {
      this.ctrl.control.setValue(numberVal);
    }
    this.numbers = numberVal;
  }

  @HostListener('keyup', ['$event.target.value', '$event']) onKeyUp(value: any, event: any) {
    const e = event as KeyboardEvent;
    const numberVal = this.allowSpecificType(e);
    event.target.value = numberVal;
    if (this.ctrl && this.ctrl.control) {
      this.ctrl.control.setValue(numberVal);
    }
  }

  allowSpecificType(e: any) {
    const regexnew = new RegExp(this.regex, 'g');
    if (!regexnew.test(e.target.value)) {
      return e.target.value.substring(0, e.target.value.length - 1);
    } else {
      return e.target.value;
    }
  }

  dotRemove(eventValue: any) {
    if (eventValue.indexOf('.') === 0) {
      return eventValue.substring(1, eventValue.length);
    } else {
      return eventValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    }
  }
}
