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
    this.loadOrdersFromStorage();
  }

  OnOrder(pid: number, item: string, price: number) {
    alert(`You order: ${item} and Price: ${price}. ID: ${pid}`);
    
    const existingOrder = this.pArray.find(order => order.id === pid);
    
    if (existingOrder) {
      existingOrder.qty++;
      existingOrder.price = (price * existingOrder.qty);
    } else {
      let pOrder = {
        id: pid,
        item: item,
        price: price,
        qty: 1,
        status: 'ordering'
      }
      this.pArray.push(pOrder);
    }
    
    this.countOrder++;
    this.saveOrdersToStorage();
    console.log(this.pArray);
  }

  // Increase quantity for existing order
  increaseOrder(pid: number) {
    const existingOrder = this.pArray.find(order => order.id === pid);
    
    if (existingOrder) {
      // Find the original product price from products array
      const originalProduct = this.products.find(p => p.prdid === pid);
      if (originalProduct) {
        existingOrder.qty++;
        existingOrder.price = (originalProduct.price * existingOrder.qty);
        this.countOrder++;
        this.saveOrdersToStorage();
        console.log('Order increased:', this.pArray);
      }
    }
  }

  // Decrease quantity or remove order
  decreaseOrder(pid: number) {
    const orderIndex = this.pArray.findIndex(order => order.id === pid);
    
    if (orderIndex !== -1) {
      const order = this.pArray[orderIndex];
      
      if (order.qty > 1) {
        // Find the original product price
        const originalProduct = this.products.find(p => p.prdid === pid);
        if (originalProduct) {
          order.qty--;
          order.price = (originalProduct.price * order.qty);
          this.countOrder--;
        }
      } else {
        // Remove the entire order
        this.pArray.splice(orderIndex, 1);
        this.countOrder--;
      }
      
      this.saveOrdersToStorage();
      console.log('Order updated:', this.pArray);
    }
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

// Remove entire order regardless of quantity
removeOrder(pid: number) {
  const orderIndex = this.pArray.findIndex(order => order.id === pid);
  
  if (orderIndex !== -1) {
    const order = this.pArray[orderIndex];
    
    // Subtract the quantity from total count
    this.countOrder -= order.qty;
    
    // Remove the entire order from array
    this.pArray.splice(orderIndex, 1);
    
    // Update localStorage
    this.saveOrdersToStorage();
    console.log('Order removed:', this.pArray);
  }
}

  clearStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('productOrders');
      this.pArray = [];
      this.countOrder = 0;
      console.log('LocalStorage cleared');
    }
  }

  getStoredOrders() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('productOrders');
    }
    return null;
  }

  // Add these calculation methods
get subtotal(): number {
  return this.pArray.reduce((total, order) => total + order.price, 0);
}

get tax(): number {
  return this.subtotal * 0.10; // 10% tax
}

get discount(): number {
  return this.subtotal * 0.30; // 30% discount
}

get total(): number {
  return (this.subtotal + this.tax) - this.discount;
}

// Get current date and time in custom format
getCurrentDateTime(): string {
  const now = new Date();
  
  // Get date components
  const day = String(now.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  
  // Get time components
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = String(hours).padStart(2, '0');
  
  return `${day}-${month}-${year} | ${formattedHours}:${minutes} ${ampm}`;
}

printReceipt() {
  const printWindow = window.open('', '', '');
  
  if (!printWindow) {
    alert('Please allow pop-ups to print the receipt');
    return;
  }

  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .receipt { max-width: 300px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .items { width: 100%; margin: 15px 0; }
        .items td { padding: 5px; border-bottom: 1px solid #ddd; }
        .summary { margin-top: 15px; border-top: 2px solid #000; padding-top: 10px; }
        .total { font-weight: bold; font-size: 18px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h2>BEAUTY STORE</h2>
          <p>${this.getCurrentDateTime()}</p>
        </div>
        <table class="items">
          <tr><th>Item</th><th>Qty</th><th>Total</th></tr>
          ${this.pArray.map(order => `
            <tr>
              <td>${order.item}</td>
              <td>${order.qty}</td>
              <td>$${order.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="summary">
          <p>Subtotal: $${this.subtotal.toFixed(2)}</p>
          <p>Tax (10%): $${this.tax.toFixed(2)}</p>
          <p>Discount (30%): $${this.discount.toFixed(2)}</p>
          <p class="total">Total: $${this.total.toFixed(2)}</p>
        </div>
        <p style="text-align: center; margin-top: 20px;">Thank you for your purchase!</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 500);
        }
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
}


}