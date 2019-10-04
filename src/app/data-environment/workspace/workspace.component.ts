import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/auth/auth.service';
import { formatDate } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/user/user.service';
import { User } from 'src/app/core/user/user';
import { stringify } from '@angular/core/src/render3/util';

@Component({
  selector: 'pd-workspace',
  templateUrl: './workspace.component.html'
})
export class WorkspaceComponent implements OnInit {
    
    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

  newDescription = "";
  newSummary = "";
  newDate: Date = new Date;
  newCollection = "";

  newPropositionForm: FormGroup;

  username: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private userService: UserService ){ }


}
