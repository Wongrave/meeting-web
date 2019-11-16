import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';


@Component({
    styleUrls: ['./signin.component.css'],
    templateUrl: './signin.component.html'
})
export class SigninComponent implements OnInit {

    user: Object;
    loginForm: FormGroup;
    @ViewChild('userNameInput', {static: false}) userNameInput: ElementRef<HTMLInputElement>;

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router
        ) { }

    ngOnInit() : void {
        this.loginForm = this.formBuilder.group({
            userName: ['', Validators.required],
            password: ['', Validators.required]
        });

    }

    login(){

        const userName = this.loginForm.get('userName').value;
        const password = this.loginForm.get('password').value;

        this.authService
            .authenticate(userName, password)
            .subscribe( 
                () => this.router.navigate(['organizations/fromUser', userName]),

                err => {
                    console.log('login invalido')
                    this.loginForm.reset();
                    alert('invalid username or password');
                    this.userNameInput.nativeElement.focus();
                }

            );
    }

}