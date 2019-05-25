import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropositionFormComponent } from './proposition-form.component';

describe('PropositionFormComponent', () => {
  let component: PropositionFormComponent;
  let fixture: ComponentFixture<PropositionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropositionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropositionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
