import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';


// Define the interface for products
interface Product {
  prdid: number;
  item: string;
  price: number;
  imgUrl: string; // <-- Added image URL property
}

// Define the interface for an order item (pArray)
interface OrderItem {
  id: number;
  item: string;
  price: number; // Note: This holds the calculated TOTAL price for the item (unit price * qty)
  qty: number;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  products: Product[] = [
    // Changed type to Product[]
    { prdid: 1, item: 'Sunscreen', price: 10.12, imgUrl: 'img/image1.png' },
    { prdid: 2, item: 'Serum', price: 15.17, imgUrl: 'img/image2.png' },
    { prdid: 3, item: 'Cream', price: 13.25, imgUrl: 'img/image3.png' },
    { prdid: 4, item: 'Lipstick', price: 9.11, imgUrl: 'img/image4.png' },
    { prdid: 5, item: 'Foam', price: 6.11, imgUrl: 'img/image5.png' },
    { prdid: 6, item: 'Toner', price: 10.14, imgUrl: 'img/image6.png' },
  ];

  countOrder = 0;
  pArray: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    this.loadOrdersFromStorage();
  }

  OnOrder(pid: number, item: string, price: number) {
    alert(`You order: ${item} and Price: ${price}. ID: ${pid}`);

    const existingOrder = this.pArray.find((order) => order.id === pid);

    if (existingOrder) {
      existingOrder.qty++;
      existingOrder.price = price * existingOrder.qty;
    } else {
      let pOrder = {
        id: pid,
        item: item,
        price: price,
        qty: 1,
        status: 'ordering',
      };
      this.pArray.push(pOrder);
    }

    this.countOrder++;
    this.saveOrdersToStorage();
    console.log(this.pArray);
  }

  // Increase quantity for existing order
  increaseOrder(pid: number) {
    const existingOrder = this.pArray.find((order) => order.id === pid);

    if (existingOrder) {
      // Find the original product price from products array
      const originalProduct = this.products.find((p) => p.prdid === pid);
      if (originalProduct) {
        existingOrder.qty++;
        existingOrder.price = originalProduct.price * existingOrder.qty;
        this.countOrder++;
        this.saveOrdersToStorage();
        console.log('Order increased:', this.pArray);
      }
    }
  }

  // Decrease quantity or remove order
  decreaseOrder(pid: number) {
    const orderIndex = this.pArray.findIndex((order) => order.id === pid);

    if (orderIndex !== -1) {
      const order = this.pArray[orderIndex];

      if (order.qty > 1) {
        // Find the original product price
        const originalProduct = this.products.find((p) => p.prdid === pid);
        if (originalProduct) {
          order.qty--;
          order.price = originalProduct.price * order.qty;
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
        count: this.countOrder,
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
    const orderIndex = this.pArray.findIndex((order) => order.id === pid);

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
    return this.subtotal * 0.1; // 10% tax
  }

  get discount(): number {
    return this.subtotal * 0.3; // 30% discount
  }

  get total(): number {
    return this.subtotal + this.tax - this.discount;
  }

  // Get current date and time in custom format
  getCurrentDateTime(): { date: string; time: string } {
    const now = new Date();

    // Get date components
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
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

    return {
      date: `${day}-${month}-${year}`,
      time: `${formattedHours}:${minutes} ${ampm}`,
    };
  }

  printReceipt() {
    const printWindow = window.open('', '', '');
    const datetime = this.getCurrentDateTime();
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

    /* Scaled-Up Styles for A4/Letter Sizing */
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 20px; /* Increased margin */
      background-color: #f4f4f4;
      color: #333;
    }

    .invoice { 
      max-width: 600px; /* Doubled the max-width for a larger display */
      margin: 30px auto; 
      padding: 40px; /* Increased padding */
      background-color: #fff;
      border: 1px solid #ddd; 
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.08); /* Slightly more pronounced shadow */
    }

    .header { 
      text-align: start; 
      padding-bottom: 25px;
      margin-bottom: 25px;
      border-bottom: 2px solid #eee; /* Slightly thicker line */
    }

    .sub-header {
      display: flex;
      justify-content: space-between;
    }

    .head-left{
      text-align :end;
    }

    .header h2 {
      font-size: 2em; /* Significantly larger store name */
      margin: 0 0 10px 0;
      color: black;
      padding-bottom: 10px;
      text-align: center; 
    }

    .header p {
      font-size: 1em; /* Increased base font size */
      color: #666;
      margin: 3px 0;
    }

    .items { 
      width: 100%; 
      border-collapse: collapse;
      font-size: 1.1em; /* Larger item text */
    }

    .items th, .items td { 
      padding: 12px 0; /* Increased vertical spacing */
      text-align: left;
      border-bottom: 1px dashed #ddd; /* Subtle change to #ddd */
    }

    .items th {
      font-weight: bold;
      color: #333;
      text-transform: uppercase;
      font-size: 0.9em; /* Item headers */
    }

    .items tr:last-child td {
      border-bottom: none;
    }

    .items .qty, .items .total-cell {
        text-align: right;
    }

    .summary { 
      display: flex;
      flex-direction: column;
      margin-top: 20px; 
      padding-top: 15px;
      border-top: 2px solid #333; /* Stronger line for financial breakdown */
      font-size: 0.9em;
      align-items: end;
      justify-content: space-between;

    }

    .summary p {
      display: flex;
      margin: 8px 0;
      max-width: 350px;
      gap: 30px;
      font-size: 18px; /* Prominent total amount */
    }

    .total { 
      font-weight: bold; 
      font-size: 24px !important; 
      color: #000;
    }

    .footer {
      text-align: center; 
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid #ddd;
      font-size: 1em; 
      color: #666;
    }

    @media print { 
      body { margin: 0; background-color: #fff; } 
      .invoice {
        max-width: 70%; 
        box-shadow: none; 
        border: none; 
        padding: 30px; 
      }
    }

  </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h2>The Beauty 'Store</h2>
          <div class="sub-header">
            <div>
              <p>Invoice #<span>123456789</span></p>
              <p>Date : ${datetime.date}</p>
              <p>Time : ${datetime.time}</p>
              <p>Counter : Sok Chan Seiha</p>
            </div>
            <div class="head-left">
              <p>Phnom Penh, 3A st292</p>
              <p>thebeautyshop@gmail.com</p>
              <p>+885 12 3456 789</p>
            </div>
          </div>
        </div>
        <table class="items">
          <thead>
            <tr>
              <th>Product</th>
              <th class="qty">Qty</th>
              <th class="qty">Price</th>
              <th class="total-cell">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${this.pArray
              .map(
                (order) => `
              <tr>
                <td>${order.item}</td>
                <td class="qty">${order.qty}</td>
                <td class="qty">$${order.price / order.qty}</td>
                <td class="total-cell">$${order.price.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="summary">
          <p><span>Subtotal :</span> <span>$${this.subtotal.toFixed(2)}</span></p>
          <p><span>Tax (10%) :</span><span>$${this.tax.toFixed(2)}</span></p>
          <p><span>Discount (30%) :</span><span>$${this.discount.toFixed(2)}</span></p>
          <p class="total"><span>Total:</span><span>$${this.total.toFixed(2)}</span></p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
          window.close();
        }
      </script>
    </body>
    </html>
  `);

    printWindow.document.close();
  }
}
