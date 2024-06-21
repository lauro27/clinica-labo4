import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormControl, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgClass } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [NgClass, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  isEspecialista: boolean = false;
  showForm: boolean = false;

  formBuilder = inject(FormBuilder);
  router = inject(Router);
  afAuth = inject(AngularFireAuth);
  afStorage = inject(AngularFireStorage);

  registerForm = this.formBuilder.group({
    firstName: ['', Validators.required, Validators.pattern("^[a-zA-Z ]{4,}$")],
    lastName: ['', Validators.required, Validators.pattern("^[a-zA-Z ]{4,}$")],
    age: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
    dni: ['', [Validators.required, Validators.pattern("^[0-9]{7,8}$")]],
    insurance: ['', this.isEspecialista ? Validators.nullValidator : Validators.required],
    specialty: ['', this.isEspecialista ? Validators.required : Validators.nullValidator],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(15),
        Validators.pattern("^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!#?$%^&*-]).{8,}$")
      ]
    ],
    profilePicture1: ['', Validators.required],
    profilePicture2: ['', Validators.required]  
  });

  registerAsSpecialist() {
    this.showForm = true;
    this.isEspecialista = true;
  }

  registerAsPatient() {
    this.showForm = true;
    this.isEspecialista = false;
  }

  onFileSelect(event: any, field: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const registerForm = this.registerForm;
      if (registerForm != null) {
        const formControl = registerForm.get(field);
        if (formControl != null) {
          formControl.setValue(file);
        }
      }
    }
  }

  async register() {
    const { email, password, profilePicture1, profilePicture2 } = this.registerForm.value;
  
    try {
      // Register the user
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;
  
      // Upload the profile pictures
      const filePath1 = `users/${userId}/profilePicture1`;
      const filePath2 = `users/${userId}/profilePicture2`;
      const task1 = this.afStorage.upload(filePath1, profilePicture1);
      const task2 = this.afStorage.upload(filePath2, profilePicture2);
  
      // Wait for the uploads to complete
      const snapshot1 = await task1;
      const snapshot2 = await task2;
  
      // Get the download URLs of the profile pictures
      const profilePictureUrl1 = await snapshot1.ref.getDownloadURL();
      const profilePictureUrl2 = await snapshot2.ref.getDownloadURL();
  
      // Update the user's profile with the profile picture URLs
      await userCredential.user.updateProfile({
        photoURL: profilePictureUrl1  // You might want to store the second URL in your own database
      });
  
      console.log('User registered successfully');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  }
}
