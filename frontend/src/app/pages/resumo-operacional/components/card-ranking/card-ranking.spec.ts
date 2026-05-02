import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRanking } from './card-ranking';

describe('CardRanking', () => {
  let component: CardRanking;
  let fixture: ComponentFixture<CardRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRanking],
    }).compileComponents();

    fixture = TestBed.createComponent(CardRanking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
