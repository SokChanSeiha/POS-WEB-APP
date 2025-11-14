import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  products = [
    { prdid: 1, item: 'Sunscreen', price: 10.12 },
    { prdid: 2, item: 'Serum', price: 15.17 },
    { prdid: 3, item: 'Cream', price: 13.25 },
    { prdid: 4, item: 'Lipstick', price: 9.11 },
    { prdid: 5, item: 'Foam', price: 6.11 },
    { prdid: 6, item: 'Toner', price: 10.14 },
  ];
  
  countOrder = 0;
  pArray: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    // Load orders from localStorage when component initializes (browser only)
    this.loadOrdersFromStorage();
  }

  OnOrder(pid: number, item: string, price: number) {
    alert(`You order: ${item} and Price: ${price}. ID: ${pid}`);
    
    // Check if product already exists in pArray
    const existingOrder = this.pArray.find(order => order.id === pid);
    
    if (existingOrder) {
      // If exists, increase quantity and update price
      existingOrder.qty++;
      existingOrder.price = (price * existingOrder.qty);
    } else {
      // If new product, add to array
      let pOrder = {
        id: pid,
        item: item,
        price: price,
        qty: 1,
        status: 'ordering'
      }
      this.pArray.push(pOrder);
    }
    
    // Update the count
    this.countOrder++;
    
    // Save to localStorage (browser only)
    this.saveOrdersToStorage();
    
    console.log(this.pArray);
  }

private saveOrdersToStorage() {
  if (typeof localStorage !== 'undefined') {
    const ordersData = {
      orders: this.pArray,
      count: this.countOrder
    };
    localStorage.setItem('productOrders', JSON.stringify(ordersData));
  }
}

private loadOrdersFromStorage() {
  if (typeof localStorage !== 'undefined') {
    const storedOrders = localStorage.getItem('productOrders');
    if (storedOrders) {
      try {
        const ordersData = JSON.parse(storedOrders);
        this.pArray = ordersData.orders || [];
        this.countOrder = ordersData.count || 0;
      } catch (error) {
        console.error('Error parsing stored orders:', error);
        this.pArray = [];
        this.countOrder = 0;
      }
    }
  }
}

  // Optional: Method to clear localStorage (browser only)
  clearStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('productOrders');
      this.pArray = [];
      this.countOrder = 0;
      console.log('LocalStorage cleared');
    }
  }

  // Optional: Method to get all stored orders (for debugging)
  getStoredOrders() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('productOrders');
    }
    return null;
  }
}