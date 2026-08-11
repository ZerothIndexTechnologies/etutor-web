import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
/*Custom Directives*/
import { InputTypeValidation } from '../directives/customValidation-directive';
/*Custom Services*/
import { CustomValidationService } from '../services/customValidations.service';
import { MaterialCoreModule } from './materialcore.module';

@NgModule({
  declarations: [InputTypeValidation],
  imports: [
    CommonModule,
    MaterialCoreModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [CustomValidationService],
  exports: [ReactiveFormsModule, FormsModule],
})
export class SharedCoreModule {}
