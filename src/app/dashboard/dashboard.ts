import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Add this import

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard {
  products = [
    { prdid: 1, item: 'Sunscreen', price: 10.12 },
    { prdid: 2, item: 'Serum', price: 15.17 },
    { prdid: 3, item: 'Cream', price: 13.25 },
    { prdid: 4, item: 'Lipstick', price: 9.11},
    { prdid: 5, item: 'Foam', price: 6.11},
    { prdid: 6, item: 'Toner', price: 10.14},
  ];
  countOrder = 0;
  pArray=new Array();
  OnOrder(pid:number, item: string, price: number) {
    alert(`You order: ${item} and Price:  ${price}. ID: ${pid}`);
    let pOrder ={
      id: pid,
      item: item,
      price:price,
      qty:1,
      status:'ordering'
    }
    this.pArray.push(pOrder);
    console.log(this.pArray);
    this.countOrder++;

  }

}