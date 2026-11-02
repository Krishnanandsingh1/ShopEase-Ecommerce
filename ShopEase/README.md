# ShopEase – Full-stack E-Commerce Portfolio Project

## Requirements
- Windows 10/11
- Node.js LTS and npm
- MySQL Server and MySQL Workbench
- VS Code

## Setup
1. Extract the ShopEase folder.
2. Open it in VS Code.
3. In MySQL Workbench, open `database/shopease.sql` and execute the complete script.
   If you already have a ShopEase database, run this once to add payment-method support to existing orders:
   `ALTER TABLE orders ADD COLUMN payment_method ENUM('Cash on Delivery','UPI (Demo)','Card (Demo)') NOT NULL DEFAULT 'Cash on Delivery';`
4. Copy `.env.example` to `.env`.
5. Update DB_PASSWORD and JWT_SECRET in `.env`.
6. Open VS Code terminal in the project folder and run:
   `npm install`
7. Create the admin account once (instructions below).
8. Start the server:
   `npm run dev`
9. Open `http://localhost:3000`.

## Create an admin account
The signup page creates customer accounts only. This is intentional.
After creating a normal account, run this SQL in MySQL Workbench, replacing the email:
`UPDATE users SET role='admin' WHERE email='your-email@example.com';`
Then login again. Admin page: `http://localhost:3000/admin.html`.

## Test the project
- Register a customer and login.
- Browse products and add one to cart.
- Open cart, change quantity, remove an item.
- Checkout with a sample address and phone number.
- Open My Orders and check the new order.
- Promote a separate account to admin using the SQL above.
- Login as admin, add/edit/delete products and update order status.

## Important
- Checkout is a demo order flow. It does not charge a card or integrate a payment gateway.
- Checkout offers Cash on Delivery, UPI (Demo), and Card (Demo); UPI and card are labels only and no payment or card details are collected.
- My Orders shows order progress and an estimated delivery date. Delivery status changes when an admin updates the order; no courier service is connected.
- Product images are remote Unsplash images; internet is required for those images.
- For production, add CSRF protection, stronger validation, secure cookie-based sessions, payment provider integration, email verification, image upload/storage, logging, tests, and deployment configuration.
- Never commit `.env` or real credentials to GitHub.
