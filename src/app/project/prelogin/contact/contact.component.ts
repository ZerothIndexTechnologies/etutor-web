import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

  contactUsForm: FormGroup;
  constructor(private formBuilder: FormBuilder) {
    this.contactUsForm = this.formBuilder.group({
      name: ['', Validators.required],
      mail_id: ['', Validators.required, Validators.email],
      meesage: ['']
    })
  }
}
