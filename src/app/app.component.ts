import { Component } from '@angular/core';
import { IsbnService } from './isbn.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'isbn';
  barcodes: string[] = [];
  badScanMode = false;
  activeBarcode: HTMLElement;
  scannedValue = '';
  scannedDigitArray: string[] = [];
  scannedDigitProducts: number[] = [];

  constructor(private isbnService: IsbnService) { }

  createNewBarcode() {
    let newBarcode = this.isbnService.generate();

    this.barcodes.push(newBarcode);
  }

  onBarcodeClick(e: Event) {
    if (this.activeBarcode) {
      this.activeBarcode.classList.remove('active');

      if (this.activeBarcode === e.target) {
        let validIndicator = document.getElementById('valid-indicator');
        this.activeBarcode = null;
        this.scannedValue = '';
        validIndicator.innerText = '';
        validIndicator.hidden = true;
        document.getElementById('computed-checksum').innerText = '';
      } else {
        this.scanBarcode(e.target as HTMLElement);
      }
    } else {
      this.scanBarcode(e.target as HTMLElement);
    }
  }

  setBadScanMode(val: boolean) {
    this.badScanMode = val;
  }

  private scanBarcode(barcodeElement: HTMLElement) {
    let validIndicator = document.getElementById('valid-indicator');
    this.activeBarcode = barcodeElement;
    barcodeElement.classList.add('active');

    if (this.badScanMode) {
      this.scannedValue = this.addNoise(barcodeElement.innerText);
    } else {
      this.scannedValue = barcodeElement.innerText;
    }

    validIndicator.hidden = false;
    this.populateTable(this.scannedValue);
    let isValid = this.isbnService.isValid(this.scannedValue);

    if (isValid.isValid) {
      validIndicator.innerText = '✓';
      validIndicator.classList.add('valid');
    } else {
      validIndicator.innerText = '✗';
      validIndicator.classList.remove('valid');
    }

    document.getElementById('computed-checksum').innerText = isValid.checksum;
  }

  private addNoise(isbn: string, digitNum: number = 1): string {
    digitNum = digitNum < isbn.length ? digitNum : isbn.length;
    let indexList: number[] = [];
    let noisyDigits: number[] = [];
    let result = '';
    
    if (digitNum === 0) { return; }

    for (let i = 0; i < digitNum; ++i) {
      let index: number;

      do {
        index = Math.floor(Math.random()*isbn.length);
      } while (index > isbn.length - 1 || indexList.includes(index));

      indexList.push(index);
    }

    indexList = indexList.sort();

    for (let i of indexList) {
      let digit = Number(isbn.charAt(i));
      let noise = Math.floor(Math.random() * 8) + 1;
      let noisyDigit = (digit + noise) % 10;
      
      noisyDigits.push(noisyDigit);
    }

    for (let i = 0; i < indexList.length; ++i) {
      let slice: string = '';

      if (i === 0) {
        slice = isbn.substring(0, indexList[i]) + String(noisyDigits[i]);
      } else {
        slice = isbn.substring(indexList[i-1]+1, indexList[i]);
        slice += String(noisyDigits[i]);
      }

      if (i === indexList.length - 1) {
        slice = isbn.substring(indexList[i-1]+1, indexList[i]);
        slice += noisyDigits[i];
        slice += isbn.substr(indexList[i]+1);
      }

      result += slice;
    }

    return result;
  }

  private populateTable(isbn: string) {
    this.scannedDigitArray = [];
    this.scannedDigitProducts = [];
    let productSum = 0;

    for (let digit of isbn) {
      this.scannedDigitArray.push(digit);
    }

    for (let i = 0; i < 9; ++i) {
      this.scannedDigitProducts.push((10 - i) 
          * Number(this.scannedDigitArray[i]));
    }

    for (let val of this.scannedDigitProducts) {
      productSum += val;
    }

    this.scannedDigitProducts.push(productSum);
  }
}
