// item-form.component.ts
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe, Location } from '@angular/common';
import { thMobile } from '../../../shared/validators/th-mobile.validator';
import { ItemService } from '../../item.service';
import { ItemStatus } from '../../models/item';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss'
})
export class ItemFormComponent implements OnInit {

  @Input()
  id: number | null = null;

  // injects
  location = inject(Location);
  fb = inject(NonNullableFormBuilder)
  itemService = inject(ItemService)
  authService = inject(AuthService);

  // formControls
  title = this.fb.control<string>('', { validators: Validators.required });
  contactMobileNo = this.fb.control<string>('', { validators: [Validators.required, thMobile] });
  amount = this.fb.control<number>(0, { validators: [Validators.required, Validators.min(1)] });
  price = this.fb.control<number>(0, { validators: [Validators.required, Validators.min(0.5)] });
  owner = this.fb.control(this.authService.loggedInUser?.userProfile.displayname || '');

  // formGroup
  fg = this.fb.group({
    title: this.title,
    contactMobileNo: this.contactMobileNo,
    amount: this.amount,
    price: this.price,
    owner:this.owner
  })

  ngOnInit() {
    console.log('id', this.id)
    if (this.id) {
      this.itemService.get(this.id).subscribe(v => this.fg.patchValue(v))
    }
  }


  onBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    const item = {...this.fg.getRawValue(), status: ItemStatus.PENDING };
    console.log(item)
    if (this.id) {
      this.itemService.edit(this.id, item).subscribe(() => this.onBack());
    } else {
      this.itemService.add(item).subscribe(() => this.onBack())
    }
  }
}
