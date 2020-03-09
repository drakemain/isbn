import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IsbnService {

  constructor() { }

  public generate(): string {
    let newIsbn = '';

    for (let i = 0; i < 9; ++i) {
      newIsbn += Math.floor(10*Math.random());
    }

    return newIsbn + String(this.computeChecksum(newIsbn));
  }

  public isValid(isbn: string): any {
    let computed = this.computeChecksum(isbn);
    let received = isbn.charAt(isbn.length - 1);

    return {
      isValid: computed === received,
      checksum: computed
    };
  }

  private computeChecksum(isbn: string): string {
    let sum = 0;
    let result = 0;

    if (isbn.length >= 9) {
      for (let i = 0; i < 9; ++i) {
        let digit = Number( isbn.charAt(i) );

        if (digit === NaN) {
          throw new Error('ISBN Contained non-numeric char!');
        }
        sum += digit * (10 - i);
      }
    } else {
      throw new Error('ISBN too short!');
    }
    
    result = (11 - (sum % 11)) % 11;

    return result !== 10 ? String(result) : 'X';
  }
}
