import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsCell } from './actions-cell';

describe('ActionsCell', () => {
  let component: ActionsCell;
  let fixture: ComponentFixture<ActionsCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsCell],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsCell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
